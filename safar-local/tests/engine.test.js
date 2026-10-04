import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregate,opportunities,infer,makeMessage,seedConversations,evidence,culturalGuidance,PACK,INTENTS,loadConversations,STORAGE_KEY} from '../src/engine.js';

test('the complete demo produces 7 roasting, 6 tasting and 5 farm visitors',()=>{
 const seeded=seedConversations();assert.equal(seeded.length,15);
 const data=aggregate([{id:'new',recordUse:'practice',number:16,createdAt:new Date().toISOString(),messages:[makeMessage('Can you show us how the coffee is roasted?'),makeMessage(PACK.phrases[16][1],'operator','ur')]},...seeded],7,new Date(),'practice');
 assert.equal(data.counts['Coffee roasting'],7);assert.equal(data.counts['Coffee tasting'],6);assert.equal(data.counts['Farm walk'],5);
 assert.deepEqual(opportunities(data.counts).map(o=>o.id),['bean','walk','food']);
});
test('repeated visitor mentions and operator suggestions cannot inflate demand',()=>{
 const c={id:'test',recordUse:'visitor',createdAt:new Date().toISOString(),messages:[makeMessage(PACK.phrases[0][0]),makeMessage(PACK.phrases[0][0]),makeMessage(PACK.phrases[3][0],'operator')]};
 assert.deepEqual(aggregate([c]).counts,{'Coffee roasting':1});
});
test('unknown translation stays unavailable, with low confidence and fixed taxonomy',()=>{
 const result=infer('A completely unfamiliar sentence.');assert.equal(result.translated_text,null);assert.equal(result.intent,'OTHER');assert.ok(result.confidence<.55);
 for(const text of ['Can we book?','How much?','I feel unsafe','It was terrible','Can children join?',...PACK.phrases.map(p=>p[0])])assert.ok(INTENTS.includes(infer(text).intent));
});
test('all bundled pairs round-trip and replies retain operator role',()=>{
 for(const p of PACK.phrases){assert.equal(infer(p[0],'en').translated_text,p[1]);assert.equal(infer(p[1],'ur').translated_text,p[0]);}
 assert.equal(makeMessage(PACK.phrases[16][1],'operator','ur').role,'operator');
});
test('evidence contains only supporting visitor messages, and periods exclude old visits',()=>{
 const c=seedConversations();const data=aggregate(c,7,new Date(),'practice');const found=evidence(data.conversations,['Coffee roasting']);assert.equal(found.length,6);assert.ok(found.every(e=>e.message.role==='visitor'&&e.message.topics.includes('Coffee roasting')));
 const old={...c[0],createdAt:'2020-01-01T10:00:00Z'};assert.equal(aggregate([old]).visitors,0);
 assert.deepEqual(opportunities({}),[]);
});
test('cultural unknowns acknowledge uncertainty, known payment context is qualified',()=>{
 assert.ok(culturalGuidance('Unfamiliar scenario xyz').low);assert.match(culturalGuidance('The host refused when I offered to pay.').explanation,/possible|some/);
});
test('an intentionally empty store remains empty after reload',()=>{
 globalThis.localStorage={getItem:key=>key===STORAGE_KEY?'[]':null};assert.deepEqual(loadConversations(),[]);
 globalThis.localStorage={getItem:()=>null};assert.equal(loadConversations().length,15);
 globalThis.localStorage={getItem:()=>'{corrupt'};assert.deepEqual(loadConversations(),[]);
 delete globalThis.localStorage;
});
