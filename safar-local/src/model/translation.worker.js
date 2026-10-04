import {AutoTokenizer,AutoModelForSeq2SeqLM,env} from '@huggingface/transformers';
import {translationChunks,translationWarnings} from './translation-policy.js';
env.allowRemoteModels=false;env.allowLocalModels=true;env.localModelPath='/models/';env.useBrowserCache=false;
env.backends.onnx.wasm.wasmPaths='/wasm/';env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;
let model,tokenizer,direction;
async function load(src){if(direction===src&&model)return;await model?.dispose();model=null;tokenizer=null;direction=null;
 const name=`opus-mt-${src}-${src==='en'?'ur':'en'}`;
 tokenizer=await AutoTokenizer.from_pretrained(name);
 model=await AutoModelForSeq2SeqLM.from_pretrained(name,{dtype:'q8',device:'wasm'});direction=src;
}
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{try{
 const chunks=translationChunks(data.text),start=performance.now();
 self.postMessage({id:data.id,progress:'Loading the translation model locally…'});await load(data.src);
 const outputs=[];
 for(let i=0;i<chunks.length;i++){
  self.postMessage({id:data.id,progress:`Translating part ${i+1} of ${chunks.length} on this device…`});
  const inputs=tokenizer(chunks[i],{truncation:false});if(inputs.input_ids.dims.at(-1)>256)throw new Error('This sentence has too many tokens. Please split it into shorter messages.');
  const result=await model.generate({...inputs,max_new_tokens:192,num_beams:1,do_sample:false});
  const ids=result.tolist()[0];if(!ids.slice(1).some(n=>Number(n)===0))throw new Error('Translation reached its length limit. Please use shorter sentences; no partial translation was saved.');
  const text=tokenizer.decode(ids,{skip_special_tokens:true}).trim();if(!text)throw new Error('The model returned no translation. Please rephrase.');outputs.push(text);
 }
 const text=outputs.join(' ');self.postMessage({id:data.id,result:{text,sourceLanguage:data.src,targetLanguage:data.src==='en'?'ur':'en',model:`OPUS-MT ${data.src==='en'?'English → Urdu':'Urdu → English'} · int8`,elapsedMs:Math.round(performance.now()-start),warnings:translationWarnings(data.text,text,data.src),chunks:chunks.length}});
 }catch(e){self.postMessage({id:data.id,error:e.message||'Translation failed on this device.'})}})};
