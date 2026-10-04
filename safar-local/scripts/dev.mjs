import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
async function run(args){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd:root,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`Command exited with ${code}`)))})}
try{
 if(process.env.SAFAR_SKIP_AI_SETUP!=='1')await run(['scripts/setup-ai.mjs']);
 await run(['node_modules/vite/bin/vite.js','--host','127.0.0.1',...process.argv.slice(2)]);
}catch(error){console.error(error.message);process.exitCode=1}
