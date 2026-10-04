import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {scoreEmbedding} from '../src/model/semantic-score.js';
import {classifyIntent} from '../src/model/classifier.js';
import {validateBusiness,DEMO_BUSINESS,mapLink} from '../src/business.js';
import {infer} from '../src/engine.js';
const rows=JSON.parse(fs.readFileSync(new URL('../data/english-embeddings.json',import.meta.url)));
const report=JSON.parse(fs.readFileSync(new URL('../data/semantic-evaluation.json',import.meta.url)));
test('browser scoring reproduces the Python semantic evaluation',()=>{
 for(const r of rows.filter(r=>r.split==='test')){const expected=report.results.find(e=>e.id===r.id);const result=scoreEmbedding(r.embedding);assert.equal(result.intent,expected.prediction);assert.equal(result.rawIntent,expected.raw_prediction);assert.equal(result.accepted,expected.accepted)}
});
test('training, validation and test groups do not overlap',()=>{
 const corpus=JSON.parse(fs.readFileSync(new URL('../data/intent-corpus.json',import.meta.url)));const split=new Map();for(const r of corpus){if(split.has(r.group))assert.equal(split.get(r.group),r.split);split.set(r.group,r.split)}
});
test('the unused tiny baseline defers text without vocabulary coverage',()=>{assert.equal(classifyIntent('zzzxqv 97865432').accepted,false)});
test('business coordinates are validated and zero is a valid location',()=>{
 assert.equal(validateBusiness({...DEMO_BUSINESS,latitude:'0',longitude:'0'}).latitude,0);
 for(const value of ['', 'not a coordinate', '91','Infinity'])assert.throws(()=>validateBusiness({...DEMO_BUSINESS,latitude:value}));
 assert.throws(()=>validateBusiness({...DEMO_BUSINESS,longitude:181}));
 assert.throws(()=>validateBusiness({...DEMO_BUSINESS,name:' '}));
});
test('map links contain only a location, not visitor transcripts',()=>{const link=mapLink(DEMO_BUSINESS);assert.ok(link.startsWith('https://www.openstreetmap.org/?mlat='));assert.ok(!link.includes(DEMO_BUSINESS.description))});
test('picking beans does not count as a coffee purchase',()=>{assert.ok(!infer('Could we have a go at picking the beans ourselves?','en').topics.includes('Coffee sales'))});
