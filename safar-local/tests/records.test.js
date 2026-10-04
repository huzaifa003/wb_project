import test from 'node:test';
import assert from 'node:assert/strict';
import {recordsForInsights} from '../src/records.js';
import {aggregate,makeMessage} from '../src/engine.js';
import {currentNotes} from '../src/trial.js';
import {recordsExport} from '../src/export-records.js';
test('all legacy and sample records remain included without mutation',()=>{
 const items=[{demo:true},{demo:false},{recordUse:'practice'},{recordUse:'visitor'}];
 const before=JSON.stringify(items);
 assert.deepEqual(recordsForInsights(items),items);
 assert.notEqual(recordsForInsights(items),items);
 assert.equal(JSON.stringify(items),before);
});
test('all saved conversations feed insights, trial evidence and export',()=>{
 const base={createdAt:new Date().toISOString(),messages:[makeMessage('Can you show us how the coffee is roasted?')]};
 const conversations=[{...base,id:'real',recordUse:'visitor'},{...base,id:'test',recordUse:'practice'},{...base,id:'legacy',demo:false},{...base,id:'demo',demo:true}];
 assert.equal(aggregate(conversations).visitors,4);
 assert.deepEqual(aggregate(conversations).counts,{'Coffee roasting':4});
 assert.deepEqual(currentNotes(conversations).map(n=>n.party),['real','test','legacy','demo']);
 assert.deepEqual(recordsExport(conversations).conversations.map(c=>c.id),['real','test','legacy','demo']);
 assert.equal(conversations.length,4,'classification preserves every saved record');
});