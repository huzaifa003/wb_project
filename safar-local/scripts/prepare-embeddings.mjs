import {pipeline,env} from '@huggingface/transformers';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
env.allowRemoteModels=false;
env.localModelPath=fileURLToPath(new URL('../public/models/',import.meta.url));
const rows=JSON.parse(fs.readFileSync(new URL('../data/intent-corpus.json',import.meta.url),'utf8')).filter(r=>r.language==='en');
const pipe=await pipeline('feature-extraction','all-MiniLM-L6-v2',{dtype:'q8'});
for(let i=0;i<rows.length;i+=16){
  const batch=rows.slice(i,i+16);
  const result=await pipe(batch.map(r=>r.text),{pooling:'mean',normalize:true});
  batch.forEach((r,j)=>r.embedding=Array.from(result.data.slice(j*384,(j+1)*384)));
}
fs.writeFileSync(new URL('../data/english-embeddings.json',import.meta.url),JSON.stringify(rows));
console.log('Prepared local embeddings for',rows.length,'English examples.');
