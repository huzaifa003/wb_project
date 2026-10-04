import {pipeline,env} from '@huggingface/transformers';
import {scoreEmbedding} from './semantic-score.js';
env.allowRemoteModels=false;
env.allowLocalModels=true;
env.localModelPath='/models/';
env.useBrowserCache=false; // Our same-origin service worker owns the cache.
env.backends.onnx.wasm.wasmPaths='/wasm/';
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let pipelinePromise;
function getPipeline(){return pipelinePromise??=pipeline('feature-extraction','all-MiniLM-L6-v2',{dtype:'q8',device:'wasm'}).catch(e=>{pipelinePromise=null;throw e})}
let queue=Promise.resolve();
self.onmessage=({data})=>{
  queue=queue.then(async()=>{
    try {
      const pipe=await getPipeline();
      if(data.action==='load'){self.postMessage({id:data.id,result:{ready:true}});return}
      const start=performance.now();
      const output=await pipe(data.text.slice(0,2000),{pooling:'mean',normalize:true});
      self.postMessage({id:data.id,result:{...scoreEmbedding(Array.from(output.data)),elapsedMs:performance.now()-start}});
    }catch(error){self.postMessage({id:data.id,error:error.message||'Model unavailable'})}
  });
};
