import {pipeline,env} from '@huggingface/transformers';
env.allowRemoteModels=false;env.localModelPath=new URL('../public/models/',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const pipe=await pipeline('feature-extraction','all-MiniLM-L6-v2',{dtype:'q8'});
console.log((await pipe('A visitor would like a farm tour',{pooling:'mean',normalize:true})).dims);
