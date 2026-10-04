import {requireLocalModels} from '../hosting.js';
import {inspectLLMDevice,hasSharedLLM,prepareSharedLLM,runSharedLLM,stopSharedLLM,removeSharedLLM,watchSharedLLM,sharedLLMManifest} from './shared-llm-service.js';
import manifest from './culture-manifest.json';
import {recommendMode,executionPolicy} from './culture-policy.js';
import {unloadSemanticModel} from './service.js';
export const cultureManifest={...manifest,text:sharedLLMManifest};
const CACHE='safar-model-v1';
const runtime=['/wasm/ort-wasm-simd-threaded.jsep.wasm','/wasm/ort-wasm-simd-threaded.jsep.mjs'];
let worker,pending,sequence=0,active=null,controller,operation=0,activePack,activeBackend,gpuFailed=false;
export async function inspectDevice(){
 let storage={};try{storage=await navigator.storage?.estimate()||{}}catch{}
 const memoryGB=navigator.deviceMemory||null,freeBytes=storage.quota==null?null:Math.max(0,storage.quota-storage.usage);
 const saveData=!!navigator.connection?.saveData;
 const gpu=await inspectLLMDevice(),webgpuAvailable=gpu.eligible&&!gpuFailed;
 return {memoryGB,freeBytes,saveData,...executionPolicy({memoryGB,webgpuAvailable}),recommended:recommendMode({memoryGB,freeBytes,saveData})};
}
export function currentCultureMode(){return active}
export function stopCultureModel(){
 operation++;stopSharedLLM();
 controller?.abort();controller=null;worker?.terminate();worker=null;active=null;
 if(pending){clearTimeout(pending.timer);pending.reject(new Error('Stopped. Bundled guidance is still available.'));pending=null}
}
function request(data){
 if(pending)throw new Error('Wait for the current operation, or stop it.');
 if(!worker){worker=new Worker(new URL('./culture.worker.js',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{if(pending?.id!==data.id)return;const p=pending;pending=null;clearTimeout(p.timer);data.error?p.reject(new Error(data.error)):p.resolve(data.result)};
  worker.onerror=()=>stopCultureModel();
 }
 return new Promise((resolve,reject)=>{const id=++sequence;pending={id,resolve,reject,timer:setTimeout(stopCultureModel,120000)};worker.postMessage({...data,id})});
}
export async function cachedCultureMode(mode){const device=await inspectDevice(),pack=mode==='text'?device.textPack:mode;if(pack==='text')return hasSharedLLM();const cache=await caches.open(CACHE);return (await Promise.all(manifest[pack].files.map(f=>cache.match(f.url,{ignoreVary:true})))).every(Boolean)}
export async function prepareCultureModel(mode,progress){
 requireLocalModels();
 stopCultureModel();const ownOperation=operation;
 const capacity=await inspectDevice(),pack=mode==='text'?capacity.textPack:mode,backend=capacity.backend;
 if(mode==='vision'&&!capacity.canVision)throw new Error('Photos require at least 8 GB reported RAM and working WebGPU. Use the small text assistant on this device.');
 if(mode==='text'&&backend==='webgpu'){const off=watchSharedLLM(progress);try{await prepareSharedLLM();if(ownOperation!==operation)throw new Error('Stopped.');active='text';activePack='text';activeBackend='webgpu';return {pack:'text',backend:'webgpu'}}finally{off()}}
 if(capacity.freeBytes!==null&&capacity.freeBytes<manifest[pack].bytes*2+100e6&&!await cachedCultureMode(mode))throw new Error('Not enough estimated browser storage for this pack and temporary copies. Use Everyday mode or free space first.');
 if(ownOperation!==operation)throw new Error('Stopped.');
 unloadSemanticModel();controller=new AbortController();const signal=controller.signal;
 const cache=await caches.open(CACHE),files=[...manifest[pack].files.map(f=>f.url),...runtime];
 try{
  for(let i=0;i<files.length;i++){
   if(signal.aborted)throw new Error('Stopped.');
   progress(`Preparing ${mode==='text'?'text':'photo'} pack · file ${i+1} of ${files.length}`);
   if(!await cache.match(files[i],{ignoreVary:true})){
    const response=await fetch(files[i],{signal});if(!response.ok)throw new Error('Model pack unavailable. Reconnect to the local app to prepare it.');await cache.put(files[i],response);
   }
  }
  if(signal.aborted)throw new Error('Stopped.');
  progress('Starting locally. This may take a minute…');
  try{await request({action:'load',mode,pack,backend})}catch(error){if(backend==='webgpu'&&!signal.aborted){gpuFailed=true;if(mode==='text'){progress('WebGPU could not start. Preparing the small CPU text model…');return await prepareCultureModel('text',progress)}}throw error}
  active=mode;activePack=pack;activeBackend=backend;return {pack,backend};
 }catch(error){if(ownOperation===operation)stopCultureModel();throw error}finally{if(ownOperation===operation)controller=null}
}
export async function generateCulture(messages){if(active!=='text')throw new Error('Prepare the text pack first.');return activeBackend==='webgpu'?runSharedLLM({action:'generate',messages}):request({action:'generate',mode:'text',pack:activePack,backend:activeBackend,messages})}
export async function describePhoto(photo){if(active!=='vision')throw new Error('Prepare the photo pack first.');return request({action:'generate',mode:'vision',pack:activePack,backend:activeBackend,photo})}
export async function removeCulturePack(mode){stopCultureModel();const device=await inspectDevice(),pack=mode==='text'?device.textPack:mode;if(pack==='text')return removeSharedLLM();const cache=await caches.open(CACHE);await Promise.all(manifest[pack].files.map(f=>cache.delete(f.url,{ignoreVary:true})));}
