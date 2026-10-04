import {pipeline,env} from '@huggingface/transformers';
import {writeFile} from 'node:fs/promises';
env.allowRemoteModels=false;env.localModelPath=new URL('../public/models/',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
env.useBrowserCache=false;
const cases={en:['We would like to visit your farm tomorrow morning.','How much does the tour cost for three adults?','Please do not take photographs of my children.'],ur:['ہم کل صبح آپ کے کھیت میں آنا چاہتے ہیں۔','تین لوگوں کے لیے قیمت کتنی ہے؟','براہ کرم میرے بچوں کی تصاویر نہ لیں۔']};
const results=[];
for(const [src,texts] of Object.entries(cases)){
 const pipe=await pipeline('translation',`opus-mt-${src}-${src==='en'?'ur':'en'}`,{dtype:'q8',device:'cpu'});
 for(const text of texts){const start=performance.now();const result=await pipe(text,{max_new_tokens:128,num_beams:1,do_sample:false});results.push({source:src,text,result,elapsedMs:Math.round(performance.now()-start)});console.log(JSON.stringify(results.at(-1)))}
 await pipe.dispose();
}
await writeFile(new URL('../data/translation-smoke.json',import.meta.url),JSON.stringify({environment:'Node CPU on development computer; not a phone benchmark',results},null,2));
