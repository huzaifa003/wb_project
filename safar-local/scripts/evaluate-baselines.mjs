import fs from 'node:fs';
import {infer} from '../src/engine.js';
const path=new URL('../data/semantic-evaluation.json',import.meta.url);
const r=JSON.parse(fs.readFileSync(path));
r.keyword_baseline={correct:0,total:r.test};
for(const row of r.results){row.keyword_prediction=infer(row.text,'en').intent;if(row.keyword_prediction===row.intent)r.keyword_baseline.correct++}
fs.writeFileSync(path,JSON.stringify(r,null,2));
console.log(JSON.stringify(r.keyword_baseline));
