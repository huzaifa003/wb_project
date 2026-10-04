import {mkdir,copyFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
await mkdir(new URL('../public-demo/',import.meta.url),{recursive:true});
for(const name of ['favicon.svg','icon-192.png','icon-512.png'])await copyFile(new URL('../public/'+name,import.meta.url),new URL('../public-demo/'+name,import.meta.url));
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{cwd:root,env:{...process.env,VITE_HOSTED_DEMO:'true'},stdio:'inherit'});
process.exit(result.status??1);
