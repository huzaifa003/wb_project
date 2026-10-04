import {requireLocalModels} from '../hosting.js';
import manifest from './shared-llm-manifest.json';
import {gpuEligibility} from './shared-llm-policy.js';
export {default as sharedLLMManifest} from './shared-llm-manifest.json';
const fileCache=f=>caches.open(f.cache);
let worker,pending,sequence=0,controller,epoch=0,idleTimer,queue=Promise.resolve(),queued=0;
let status='WebGPU assistant is idle.';
const listeners=new Set();
function emit(value){status=value;for(const f of listeners)f(value)}
export function watchSharedLLM(f){listeners.add(f);f(status);return()=>listeners.delete(f)}
export async function inspectLLMDevice(){
 const memoryGB=navigator.deviceMemory||null;let available=false,half=false;
 if(gpuEligibility(memoryGB)&&navigator.gpu){try{const adapter=await navigator.gpu.requestAdapter();available=!!adapter;half=!!adapter?.features.has('shader-f16')}catch{}}
 return {memoryGB,available,eligible:available&&half,reason:!gpuEligibility(memoryGB)?'WebGPU requires at least 8 GB reported RAM.':!available?'WebGPU is unavailable in this browser.':!half?'This GPU lacks the half-precision support needed for this pack.':'4-bit WebGPU is available.'};
}
export async function hasSharedLLM(){if(!('caches' in globalThis))return false;return (await Promise.all(manifest.files.map(async f=>(await fileCache(f)).match(f.url,{ignoreVary:true})))).every(Boolean)}
export function stopSharedLLM(){epoch++;controller?.abort();controller=null;clearTimeout(idleTimer);worker?.terminate();worker=null;if(pending){clearTimeout(pending.timer);pending.reject(new Error('Stopped. Your original words are kept.'));pending=null}emit('Model stopped. Downloaded files stay available offline.')}
function request(data){
 clearTimeout(idleTimer);
 if(!worker){worker=new Worker(new URL('./shared-llm.worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(pending?.id!==data.id)return;if(data.progress){emit(data.progress);return}const p=pending;pending=null;clearTimeout(p.timer);data.error?p.reject(new Error(data.error)):p.resolve(data.result)};worker.onerror=()=>{stopSharedLLM();emit('The GPU model could not run. Use the compact translation pack or Everyday Culture.')}}
 return new Promise((resolve,reject)=>{const id=++sequence;pending={id,resolve,reject,timer:setTimeout(()=>{stopSharedLLM();emit('The GPU model took too long. Use a shorter message or the compact pack.')},180000)};worker.postMessage({...data,id})});
}
export function runSharedLLM(data){
 try{requireLocalModels()}catch(e){return Promise.reject(e)}
 if(queued>=8)return Promise.reject(new Error('Please wait for the current requests to finish.'));
 const own=epoch;queued++;
 const task=queue.catch(()=>{}).then(async()=>{
  if(own!==epoch)throw new Error('Stopped.');
  const device=await inspectLLMDevice();if(!device.eligible)throw new Error(device.reason);
  if(!await hasSharedLLM())throw new Error('Prepare the shared WebGPU pack first.');
  if(own!==epoch)throw new Error('Stopped.');
  const result=await request(data);emit('Finished on WebGPU. Review the draft.');
  idleTimer=setTimeout(()=>{if(pending)return;worker?.terminate();worker=null;emit('Pack saved; GPU memory released until needed.');},60000);
  return result;
 });queue=task;return task.finally(()=>queued--);
}
export async function prepareSharedLLM(){
 requireLocalModels();
 if(controller)throw new Error('A shared pack is already being prepared.');
 const device=await inspectLLMDevice();if(!device.eligible)throw new Error(device.reason);
 const own=epoch;controller=new AbortController();const signal=controller.signal;
 try{
  const space=await navigator.storage?.estimate();if(space?.quota&&space.quota-space.usage<manifest.bytes*2+50e6&&!await hasSharedLLM())throw new Error('This pack needs more free browser storage. Use compact translation or free some space.');
  // Retire only superseded model caches; visitor records are untouched.
  const retired=await caches.open('safar-model-v1');
  for(const request of await retired.keys()){const path=new URL(request.url).pathname;if(path.startsWith('/models/Qwen3-1.7B-ONNX/')||path.startsWith('/models/Qwen2.5-0.5B-Instruct/'))await retired.delete(request,{ignoreVary:true})}
  for(const scope of ['webllm/model','webllm/config','webllm/wasm']){const oldCache=await caches.open(scope);for(const request of await oldCache.keys()){if(['/models/Qwen3-1.7B-q4f16_1-MLC/','/models/Qwen3.5-2B-q4f16_1-MLC/'].some(p=>new URL(request.url).pathname.startsWith(p)))await oldCache.delete(request,{ignoreVary:true})}}
  const files=manifest.files;
  for(let i=0;i<files.length;i++){
   if(signal.aborted||own!==epoch)throw new Error('Download stopped.');
   const f=files[i],cache=await fileCache(f);
   const oldUrl=f.url.replace(`/resolve/${manifest.revision}/`,'/');
   if(!await cache.match(f.url,{ignoreVary:true})){const old=await cache.match(oldUrl,{ignoreVary:true});if(old&&!old.headers.get('content-type')?.includes('text/html')){await cache.put(f.url,old);await cache.delete(oldUrl,{ignoreVary:true})}}
   emit(`Preparing shared WebGPU pack · file ${i+1} of ${files.length}. Keep this page open.`);
   if(!await cache.match(f.url,{ignoreVary:true})){const response=await fetch(f.url,{signal});if(!response.ok||response.headers.get('content-type')?.includes('text/html'))throw new Error('The model file is unavailable. Reconnect to this local app.');await cache.put(f.url,response)}
  }
  if(own!==epoch)throw new Error('Stopped.');
  emit('Pack saved. Starting on WebGPU…');await runSharedLLM({action:'load'});
 }finally{if(own===epoch)controller=null}
}
export async function removeSharedLLM(){stopSharedLLM();await Promise.all(manifest.files.map(async f=>(await fileCache(f)).delete(f.url,{ignoreVary:true})));emit('Shared WebGPU pack removed. Saved records are unchanged.')}
