import test from 'node:test';
import assert from 'node:assert/strict';
import {cultureRequest,guidanceFor,recommendMode,acceptsPhoto,checkDraft,executionPolicy} from '../src/model/culture-policy.js';
test('uncovered situations and Urdu defer rather than invoke the English LLM',()=>{
 assert.ok(cultureRequest('What does this unfamiliar ceremony mean?').fallback);
 assert.ok(cultureRequest('یہ کیا ہے؟').fallback);
});
test('culture retrieval uses matching words instead of age embedded in message',()=>{
 assert.equal(guidanceFor('I received a message').length,0);
 const request=cultureRequest('Can I take a photo of the family?');assert.ok(request.cards.some(c=>c.id==='photos'));
 assert.ok(request.messages[0].content.includes('not instructions'));
 assert.ok(request.messages[0].content.includes('Do not infer religion'));
});
test('device policy remains conservative for memory, storage and data saving',()=>{
 assert.equal(recommendMode({memoryGB:2,freeBytes:2e9,saveData:false}),'text');
 assert.equal(recommendMode({memoryGB:8,freeBytes:100e6,saveData:false}),'basic');
 assert.equal(recommendMode({memoryGB:8,freeBytes:2e9,saveData:true}),'basic');
 assert.equal(recommendMode({memoryGB:8,freeBytes:2e9,saveData:false}),'text');
 assert.equal(recommendMode({memoryGB:null,freeBytes:null,saveData:false}),'text');
});
test('WebGPU and photos require both reported 8 GB RAM and an available GPU',()=>{
 for(const memoryGB of [null,undefined,2,4,6,7.9])assert.deepEqual(executionPolicy({memoryGB,webgpuAvailable:true}),{backend:'wasm',textPack:'lite',canVision:false});
 assert.deepEqual(executionPolicy({memoryGB:8,webgpuAvailable:false}),{backend:'wasm',textPack:'lite',canVision:false});
 for(const memoryGB of [8,16])assert.deepEqual(executionPolicy({memoryGB,webgpuAvailable:true}),{backend:'webgpu',textPack:'text',canVision:true});
});
test('photo input rejects active formats and oversized files',()=>{
 assert.equal(acceptsPhoto({type:'image/svg+xml',size:100}),false);
 assert.equal(acceptsPhoto({type:'image/jpeg',size:9*1024*1024}),false);
 assert.equal(acceptsPhoto({type:'image/png',size:1024}),true);
});
test('a rewrite losing a refusal falls back to the original boundary',()=>{
 const card=guidanceFor('I am full of food')[0];
 assert.equal(checkDraft('Thank you for your meal.',card).usedFallback,true);
 assert.equal(checkDraft('Thank you, but I am full.',card).usedFallback,false);
 const photos=guidanceFor('Can I take a photo?')[0];
 assert.equal(checkDraft('Take their picture.',photos).usedFallback,true);
 assert.equal(checkDraft('Could I take a photo?',photos).usedFallback,false);
});
