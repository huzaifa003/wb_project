import test from 'node:test';
import assert from 'node:assert/strict';
import {DEMO_PLAN,EMPTY_PLAN,currentNotes,selectedParties,validatePlan,economics,validateOutcome,offerText,newTrial} from '../src/trial.js';
test('trial evidence counts distinct visitors and excludes operator statements',()=>{
 const notes=currentNotes([{id:'v1',recordUse:'visitor',number:1,messages:[{id:'a',role:'visitor',original_text:'roasting',topics:[]},{id:'b',role:'visitor',original_text:'tasting',topics:[]},{id:'c',role:'operator',original_text:'yes',topics:[]}]}]);
 assert.equal(notes.length,2);assert.equal(selectedParties(notes,['a','b','deleted']),1);
});
test('Noor has an affordable three-person trial based on explicit assumptions',()=>{
 assert.deepEqual(validatePlan(DEMO_PLAN),[]);
 assert.deepEqual(economics(DEMO_PLAN),{revenue:1800,cost:1350,contribution:450,breakEven:2});
 assert.equal(economics({...DEMO_PLAN,price:'100'}).breakEven,null);
});
test('blank, negative and impossible plans cannot be approved',()=>{
 assert.ok(validatePlan(EMPTY_PLAN).length>0);
 for(const patch of [{minimum:'5'},{capacity:'2.5'},{price:'-1'},{variable:'Infinity'},{duration:'0'},{meeting:' '}])assert.ok(validatePlan({...DEMO_PLAN,...patch}).length>0);
});
test('outcome requires actual attendance, amounts, feedback and an operator decision',()=>{
 const o={guests:'3',revenue:'1800',cost:'1450',feedback:'Started late',decision:'change',next:'Prepare before arrival'};
 assert.deepEqual(validateOutcome(o,DEMO_PLAN),[]);
 for(const patch of [{guests:'5'},{guests:'-1'},{cost:''},{revenue:'-2'},{decision:'auto'},{feedback:' '},{next:''}])assert.ok(validateOutcome({...o,...patch},DEMO_PLAN).length>0);
 assert.deepEqual(validateOutcome({...o,guests:'0',revenue:'0'},DEMO_PLAN),[]);
});
test('copied demonstration cannot be mistaken for a booking or payment',()=>{
 const t=offerText(DEMO_PLAN,true);assert.match(t,/FICTIONAL DEMO/);assert.match(t,/PKR 600/);assert.match(t,/No payment has been taken/);
 assert.equal(newTrial().approved,false);assert.equal(newTrial().finished,false);
});
