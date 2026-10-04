import {MLCEngine} from '@mlc-ai/web-llm';
import manifest from './shared-llm-manifest.json';
import {translationPrompt,safeLLMMessages,checkGeneratedText} from './shared-llm-policy.js';
import {translationChunks,translationWarnings} from './translation-policy.js';
let model,progressSink=()=>{};
async function load(progress){
 progressSink=progress;if(model)return;
 progress('Starting the 4-bit model on WebGPU…');
 const overrides={context_window_size:1024,max_history_size:1,conv_config:{stop_token_ids:manifest.stopTokenIds}};
 const candidate=new MLCEngine({appConfig:{cacheBackend:'cache',model_list:[{model_id:manifest.name,model:new URL(manifest.modelBase,self.location.origin).href,model_lib:new URL(manifest.modelLib,self.location.origin).href,required_features:['shader-f16'],overrides}]},initProgressCallback:p=>progressSink(`Starting WebGPU · ${Math.round(p.progress*100)}%`),logLevel:'WARN'});
 try{await candidate.reload(manifest.name,overrides);model=candidate}catch(e){await candidate.unload().catch(()=>{});throw e}
}
async function generate(messages){
 const safe=safeLLMMessages(messages);
 await model.resetChat();
 const result=await model.chat.completions.create({messages:safe,max_tokens:192,temperature:0,top_p:1,extra_body:{enable_thinking:false}});
 const choice=result.choices[0];
 if(choice.finish_reason!=='stop')throw new Error('The draft reached its length limit. No partial result was saved. Please shorten the message.');
 return checkGeneratedText(choice.message.content||'');
}
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.catch(()=>{}).then(async()=>{try{
 const started=performance.now(),progress=message=>self.postMessage({id:data.id,progress:message});
 await load(progress);
 if(data.action==='load'){self.postMessage({id:data.id,result:{ready:true,backend:'webgpu',model:manifest.label}});return}
 let text,warnings=[],chunks=1;
 if(data.action==='translate'){
  const parts=translationChunks(data.text),out=[];chunks=parts.length;
  for(let i=0;i<parts.length;i++){progress(`Translating on WebGPU · part ${i+1} of ${parts.length}`);out.push(await generate(translationPrompt(parts[i],data.src)))}
  text=out.join(' ');warnings=translationWarnings(data.text,text,data.src);
 }else{progress('Rephrasing on WebGPU…');text=await generate(data.messages)}
 self.postMessage({id:data.id,result:{text,warnings,chunks,elapsedMs:Math.round(performance.now()-started),model:manifest.label,backend:'webgpu',sourceLanguage:data.src,targetLanguage:data.src==='en'?'ur':'en'}});
 }catch(e){self.postMessage({id:data.id,error:e.message||'WebGPU could not finish. Try the compact CPU pack.'})}})};
