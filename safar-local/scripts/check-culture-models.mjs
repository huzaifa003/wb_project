import {pipeline,env,AutoProcessor,AutoModelForVision2Seq,RawImage,TextStreamer} from '@huggingface/transformers';
import {cultureRequest,checkDraft} from '../src/model/culture-policy.js';
import fs from 'node:fs';
env.allowRemoteModels=false;env.localModelPath=new URL('../public/models/',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1');
const model=process.argv.includes('--lite')?'SmolLM2-135M-Instruct':'Qwen2.5-0.5B-Instruct';
const text=await pipeline('text-generation',model,{dtype:'q4',device:'cpu'});
const results=[];
for(const input of ['My host keeps offering me food after I said I am full. What could I say?','Can I take a photo of the family without asking?','The host will not let me pay for tea. Did I offend them?']){
 const request=cultureRequest(input),start=performance.now();const out=await text(request.messages,{max_new_tokens:120,do_sample:false,repetition_penalty:1.1,return_full_text:false});
 const item={input,output:out[0].generated_text.at(-1).content,elapsedMs:performance.now()-start,...checkDraft(out[0].generated_text.at(-1).content,request.cards[0])};results.push(item);console.log(JSON.stringify(item));
}
await text.dispose();
fs.writeFileSync(new URL(process.argv.includes('--lite')?'../data/culture-lite-smoke-results.json':'../data/culture-smoke-results.json',import.meta.url),JSON.stringify({model,notice:'Developer smoke tests, not a quality benchmark or field validation.',results},null,2));
