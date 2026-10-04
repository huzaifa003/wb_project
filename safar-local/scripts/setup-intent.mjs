import {mkdir,readFile,writeFile,rename,copyFile,stat} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const revision='751bff37182d3f1213fa05d7196b954e230abad9';
const names=['config.json','tokenizer.json','tokenizer_config.json','special_tokens_map.json','onnx/model_quantized.onnx'];
async function valid(file,name){
 try {if(name.endsWith('.json')){JSON.parse(await readFile(file,'utf8'));return true}return (await stat(file)).size===22972370}catch{return false}
}
for(const name of names){
 const file=path.join(root,'public/models/all-MiniLM-L6-v2',name);
 if(await valid(file,name)){console.log('Ready:',name);continue}
 console.log('Downloading:',name);
 const response=await fetch(`https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${revision}/${name}`);
 if(!response.ok)throw new Error(`Download failed (${response.status}): ${name}`);
 await mkdir(path.dirname(file),{recursive:true});
 const temporary=file+'.download';await writeFile(temporary,Buffer.from(await response.arrayBuffer()));
 if(!await valid(temporary,name))throw new Error(`Invalid download: ${name}. Run setup again.`);
 await rename(temporary,file);
}
const require=createRequire(import.meta.url);
const modelRequire=createRequire(require.resolve('@huggingface/transformers'));
const runtime=path.dirname(modelRequire.resolve('onnxruntime-web'));
await mkdir(path.join(root,'public/wasm'),{recursive:true});
for(const name of ['ort-wasm-simd-threaded.jsep.mjs','ort-wasm-simd-threaded.jsep.wasm']){
 await copyFile(path.join(runtime,name),path.join(root,'public/wasm',name));console.log('Ready:',name);
}
await copyFile(path.join(root,'scripts/licenses/Apache-2.0.txt'),path.join(root,'public/models/all-MiniLM-L6-v2/LICENSE.txt'));
console.log('Intent classifier installed locally. Start pnpm dev, then prepare the classifier in Talk.');
