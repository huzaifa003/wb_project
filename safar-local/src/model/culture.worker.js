import {pipeline,env,AutoProcessor,AutoModelForVision2Seq,RawImage,TextStreamer} from '@huggingface/transformers';
import manifest from './culture-manifest.json';
env.allowRemoteModels=false;
env.allowLocalModels=true;
env.localModelPath='/models/';
env.useBrowserCache=false;
env.backends.onnx.wasm.wasmPaths='/wasm/';
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let generator,processor,vision,mode,key;
async function load(next,pack,backend){
 if(key===pack+backend)return;
 await generator?.dispose();await vision?.dispose();generator=null;vision=null;processor=null;mode=null;
 if(next==='text')generator=await pipeline('text-generation',manifest[pack].name,{dtype:'q4',device:backend});
 else {
  processor=await AutoProcessor.from_pretrained('SmolVLM-256M-Instruct');
  vision=await AutoModelForVision2Seq.from_pretrained('SmolVLM-256M-Instruct',{dtype:'q4',device:backend});
 }
 mode=next;key=pack+backend;
}
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 try{
  await load(data.mode,data.pack,data.backend);
  if(data.action==='load'){self.postMessage({id:data.id,result:{ready:true}});return}
  const start=performance.now();let text='';
  if(data.mode==='text'){
   const output=await generator(data.messages,{max_new_tokens:120,do_sample:false,repetition_penalty:1.1,return_full_text:false});
   const generated=output[0].generated_text;
   text=typeof generated==='string'?generated:generated.at(-1).content;
  }else{
   const photo=new RawImage(new Uint8ClampedArray(data.photo.pixels),data.photo.width,data.photo.height,3);
   const prompt=processor.apply_chat_template([{role:'user',content:[{type:'image'},{type:'text',text:'Describe the visible objects and setting in one short sentence. Do not guess identity, culture, religion, feelings or intentions.'}]}],{add_generation_prompt:true});
   const inputs=await processor(prompt,photo,{do_image_splitting:false});
   const streamer=new TextStreamer(processor.tokenizer,{skip_prompt:true,callback_function:chunk=>{text+=chunk}});
   await vision.generate({...inputs,max_new_tokens:70,do_sample:false,repetition_penalty:1.1,streamer});
  }
  self.postMessage({id:data.id,result:{text:text.trim(),elapsedMs:performance.now()-start,mode,backend:data.backend,model:manifest[data.pack].name}});
 }catch(error){self.postMessage({id:data.id,error:error.message||'Local generation failed.'})}
})};
