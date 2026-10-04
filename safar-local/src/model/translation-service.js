import {requireLocalModels} from '../hosting.js';
import {inspectLLMDevice,hasSharedLLM,runSharedLLM,stopSharedLLM} from './shared-llm-service.js';
import manifest from './translation-manifest.json';
import {translationChunks} from './translation-policy.js';
export {default as translationManifest} from './translation-manifest.json';
const CACHE='safar-model-v1',runtime=['/wasm/ort-wasm-simd-threaded.jsep.wasm','/wasm/ort-wasm-simd-threaded.jsep.mjs'];
let worker,pending,id=0,queue=Promise.resolve(),epoch=0,controller,idleTimer,queued=0;
const listeners=new Set(),memo=new Map();
let status='Translation model is idle.',preferred='auto';
export function translationEngine(){return preferred}
export function setTranslationEngine(value){if(!['auto','compact'].includes(value))return;stopTranslation();memo.clear();preferred=value}
function emit(s){status=s;for(const f of listeners)f(s)}
export function watchTranslation(f){listeners.add(f);f(status);return()=>listeners.delete(f)}
export async function hasTranslationPack(src){if(!manifest[src]||!('caches' in globalThis))return false;const cache=await caches.open(CACHE);return (await Promise.all([...manifest[src].files.map(f=>f.url),...runtime].map(f=>cache.match(f,{ignoreVary:true})))).every(Boolean)}
export function stopTranslation(){epoch++;stopSharedLLM();controller?.abort();controller=null;clearTimeout(idleTimer);worker?.terminate();worker=null;if(pending){clearTimeout(pending.timer);pending.reject(new Error('Translation stopped. The original message is kept.'));pending=null}emit('Translation stopped. Original messages are kept.')}
export async function prepareTranslationPack(src){
 requireLocalModels();
 if(controller)throw new Error('A language pack is already being prepared.');
 if(!manifest[src])throw new Error('Choose English or Urdu.');
 const own=epoch;controller=new AbortController();const signal=controller.signal;
 try{
  const space=await navigator.storage?.estimate();if(space?.quota&&space.quota-space.usage<manifest[src].bytes*2+30e6&&!await hasTranslationPack(src))throw new Error('Not enough browser storage for this language pack. Free some space and retry.');
  const cache=await caches.open(CACHE),files=[...manifest[src].files.map(f=>f.url),...runtime];
  for(let i=0;i<files.length;i++){
   if(signal.aborted||own!==epoch)throw new Error('Download stopped.');
   emit(`Preparing translation pack · file ${i+1} of ${files.length}`);
   if(!await cache.match(files[i],{ignoreVary:true})){const response=await fetch(files[i],{signal});if(!response.ok)throw new Error('Translation files are unavailable. Reconnect to the local app and retry.');await cache.put(files[i],response)}
  }emit('Language pack ready. New messages translate automatically.');
 }finally{if(own===epoch)controller=null}
}
function request(text,src){
 clearTimeout(idleTimer);
 if(!worker){worker=new Worker(new URL('./translation.worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(pending?.id!==data.id)return;if(data.progress){emit(data.progress);return}const p=pending;pending=null;clearTimeout(p.timer);data.error?p.reject(new Error(data.error)):p.resolve(data.result)};
  worker.onerror=()=>{stopTranslation();emit('Translation could not run on this device. Try shorter text or supported phrases.')};
 }
 return new Promise((resolve,reject)=>{const next=++id;pending={id:next,resolve,reject,timer:setTimeout(()=>{stopTranslation();emit('Translation took too long. Try shorter text.')},120000)};worker.postMessage({id:next,text,src})});
}
export function translateLocalText(text,src){
 try{requireLocalModels()}catch(e){return Promise.reject(e)}
 try{translationChunks(text);if(!manifest[src])throw new Error('Translation supports English and Urdu.');if(queued>=8)throw new Error('Please wait for the queued translations to finish.')}catch(e){return Promise.reject(e)}
 const own=epoch,choice=preferred;queued++;
 const task=queue.catch(()=>{}).then(async()=>{
  if(own!==epoch)throw new Error('Translation stopped.');
  const useGPU=choice==='auto'&&(await inspectLLMDevice()).eligible&&await hasSharedLLM();
  const key=(useGPU?'webgpu':'compact')+'|'+src+'|'+text.trim();
  if(memo.has(key))return {...memo.get(key),reused:true};
  if(!useGPU&&!await hasTranslationPack(src))throw new Error('Prepare a translation pack above, then tap Translate on this message.');
  if(own!==epoch)throw new Error('Translation stopped.');
  emit(useGPU?'Translating with the shared 4-bit WebGPU model…':'Translating with the compact CPU model…');
  const result=useGPU?await runSharedLLM({action:'translate',text,src}):await request(text,src);memo.set(key,result);if(memo.size>40)memo.delete(memo.keys().next().value);emit('Translation complete. Check the draft with the speaker.');
  idleTimer=setTimeout(()=>{if(pending)return;worker?.terminate();worker=null;emit('Language pack saved; translation memory released until needed.');},60000);
  return result;
 });queue=task;return task.finally(()=>{queued--});
}
export async function removeTranslationPack(src){stopTranslation();memo.clear();const cache=await caches.open(CACHE);await Promise.all(manifest[src].files.map(f=>cache.delete(f.url,{ignoreVary:true})));emit('Language pack removed. Saved messages are unchanged.')}
export function clearTranslationMemory(){stopTranslation();memo.clear()}
