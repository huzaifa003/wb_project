import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AutoTokenizer,env} from '@huggingface/transformers';
env.allowRemoteModels=false;env.localModelPath=new URL('../public/models/',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
test('browser tokenization matches source SentencePiece IDs and EOS in both directions',async()=>{
 const cases=JSON.parse(await readFile(new URL('../data/translation-tokenizer-cases.json',import.meta.url),'utf8'));
 for(const src of ['en','ur']){const t=await AutoTokenizer.from_pretrained(`opus-mt-${src}-${src==='en'?'ur':'en'}`);for(const c of cases.filter(x=>x.src===src))assert.deepEqual(t(c.text).input_ids.tolist()[0].map(Number),c.ids,c.text)}
});
