import {requireLocalModels} from '../hosting.js';
const CACHE='safar-model-v1';
const files=['/models/all-MiniLM-L6-v2/config.json','/models/all-MiniLM-L6-v2/tokenizer.json','/models/all-MiniLM-L6-v2/tokenizer_config.json','/models/all-MiniLM-L6-v2/special_tokens_map.json','/models/all-MiniLM-L6-v2/onnx/model_quantized.onnx','/wasm/ort-wasm-simd-threaded.jsep.wasm','/wasm/ort-wasm-simd-threaded.jsep.mjs'];
let worker,ready=false,pending=new Map(),sequence=0,loading;
function request(action,text){
  if(!worker){
    worker=new Worker(new URL('./model.worker.js',import.meta.url),{type:'module'});
    worker.onmessage=({data})=>{const p=pending.get(data.id);if(p){clearTimeout(p.timer);pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data.result)}};
    worker.onerror=()=>{ready=false;for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('This device could not run the model. The phrase and rule fallback is still available.'))}pending.clear();worker.terminate();worker=null;loading=null};
  }
  return new Promise((resolve,reject)=>{const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Model took too long. Try again or use the local fallback.'))},120000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,action,text})})
}
export async function hasCachedModel(){if(!('caches' in window))return false;const cache=await caches.open(CACHE);return (await Promise.all(files.map(f=>cache.match(f,{ignoreVary:true})))).every(Boolean)}
export async function loadSemanticModel(progress=()=>{}){
 requireLocalModels();
  if(ready)return true;if(loading)return loading;
  loading=(async()=>{
    const cache=await caches.open(CACHE);
    for(let i=0;i<files.length;i++){
      progress(`Preparing file ${i+1} of ${files.length}…`);
      if(!await cache.match(files[i],{ignoreVary:true})){const response=await fetch(files[i]);if(!response.ok)throw new Error('Model files are not available. Reconnect to the local app and try again.');await cache.put(files[i],response)}
    }
    progress('Starting the model on this device…');await request('load');ready=true;progress('Ready on this device');return true;
  })().catch(e=>{loading=null;throw e});return loading;
}
export function isModelReady(){return ready}
export function unloadSemanticModel(){
  if(loading&&!ready)throw new Error('Finish preparing the intent model before starting another model.');
  if(pending.size)throw new Error('Wait for the current intent analysis to finish.');
  worker?.terminate();worker=null;ready=false;loading=null;
}
export async function predictSemantic(text){if(/[\u0600-\u06ff]/.test(text))throw new Error('This model supports English. Use the Urdu phrase pack in Talk.');if(!ready)throw new Error('Load the local model first.');return request('classify',text)}
export async function removeCachedModel(){
  if(pending.size)throw new Error('Wait for the current model operation to finish.');
  worker?.terminate();worker=null;ready=false;loading=null;const cache=await caches.open(CACHE);await Promise.all(files.filter(f=>f.startsWith('/models/')).map(f=>cache.delete(f,{ignoreVary:true})));
}
