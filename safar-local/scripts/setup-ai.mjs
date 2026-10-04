import {readFile,mkdir,stat,rename,rm} from 'node:fs/promises';
import {createReadStream,createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=async name=>JSON.parse(await readFile(path.join(root,'src/model',name),'utf8'));
function run(command,args){const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});if(result.error||result.status!==0)throw new Error(`Setup failed: ${command}. ${result.error?.message||'See the error above; rerun pnpm setup:ai to retry.'}`)}
async function valid(file,item){
 try{
  if((await stat(file)).size!==item.bytes)return false;
  if(item.sha256){const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex')===item.sha256}
  if(file.endsWith('.json'))JSON.parse(await readFile(file,'utf8'));
  return true;
 }catch{return false}
}
async function download(item,url){
 const file=path.join(root,'public',item.url);
 if(await valid(file,item))return;
 await mkdir(path.dirname(file),{recursive:true});
 for(let attempt=1;attempt<=3;attempt++){
  try{
   console.log(`Downloading ${item.url} (${(item.bytes/1e6).toFixed(1)} MB), attempt ${attempt}/3`);
   const response=await fetch(url,{signal:AbortSignal.timeout(30*60*1000)});
   if(!response.ok)throw new Error(`HTTP ${response.status}`);
   const temporary=file+'.partial';
   const progress=setInterval(()=>console.log(`Still downloading ${item.url}�`),15000);
   try{await pipeline(Readable.fromWeb(response.body),createWriteStream(temporary))}finally{clearInterval(progress)}
   if(!await valid(temporary,item))throw new Error('File size or checksum mismatch');
   await rename(temporary,file);return;
  }catch(error){if(attempt===3)throw error;console.warn(error.message)}
 }
}
console.log('Checking local AI packs. First setup downloads several GB; existing valid files are reused.');
run(process.execPath,['scripts/setup-intent.mjs']);
const culture=await manifest('culture-manifest.json');
// The current app uses the shared GPU LLM, not the retired Qwen2.5 pack.
for(const key of ['lite','vision']){
 const pack=culture[key];console.log(`Checking ${pack.name}…`);
 for(const item of pack.files)await download(item,`https://huggingface.co/${pack.repo}/resolve/${pack.revision}/${item.url.split('/'+pack.name+'/')[1]}`);
}
const shared=await manifest('shared-llm-manifest.json');
console.log(`Checking ${shared.label}…`);
for(const item of shared.files){
 const name=item.url.slice(shared.modelBase.length);
 const url=item.url===shared.modelLib?`https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/${shared.runtimeRevision}/web-llm-models/v0_2_84/base/${name}`:`https://huggingface.co/${shared.repo}/resolve/${shared.revision}/${name}`;
 await download(item,url);
}
const translations=await manifest('translation-manifest.json');
let translationMissing=false;
for(const pack of Object.values(translations))for(const item of pack.files)if(!await valid(path.join(root,'public',item.url),item)){translationMissing=true;await rm(path.join(root,'public',item.url),{force:true});}
if(translationMissing){
 console.log('Preparing compact English/Urdu translation. Python 3 is required for the one-time graph conversion.');
 const candidates=process.env.SAFAR_PYTHON?[process.env.SAFAR_PYTHON]:['python','python3','py'];
 const python=candidates.find(command=>spawnSync(command,['-c','import sys; assert sys.version_info >= (3,10)'],{stdio:'ignore'}).status===0);
 if(!python)throw new Error('Install Python 3.10+ and rerun pnpm setup:ai (or set SAFAR_PYTHON to your Python executable).');
 const environment=path.join(root,'.translation-tools','venv');
 run(python,['-m','venv',environment]);
 const executable=path.join(environment,process.platform==='win32'?'Scripts/python.exe':'bin/python');
 run(executable,['-m','pip','install','onnx==1.17.0','sentencepiece==0.2.0','numpy==2.2.6']);
 run(executable,['scripts/prepare-translation.py']);
}
console.log('All active AI packs are ready. Model downloads stay excluded from Git.');
