import test from 'node:test';
import assert from 'node:assert/strict';
import {translationChunks,translationWarnings} from '../src/model/translation-policy.js';
import {recoverInterruptedMessage} from '../src/engine.js';
test('interrupted work becomes retryable without losing the original or successful translation',()=>{
 const m={original_text:'Where can we meet?',visitor_language:'en',translation_status:'pending',method:'Analyzing on this device…'};
 const restored=recoverInterruptedMessage(m);assert.equal(restored.translation_status,'unavailable');assert.match(restored.translation_error,/retry/);assert.equal(restored.original_text,m.original_text);assert.notEqual(restored.method,m.method);
 const done={...m,translation_status:'machine',translated_text:'ترجمہ',method:'On-device MiniLM'};assert.deepEqual(recoverInterruptedMessage(done),done);
});
test('long bilingual messages split without dropping words and oversized input is rejected',()=>{
 const input=('This sentence includes a meeting point and a price. ').repeat(20);
 const chunks=translationChunks(input);assert.ok(chunks.every(c=>c.length<=220));assert.equal(chunks.join(' ').replace(/\s+/g,' ').trim(),input.trim());
 assert.throws(()=>translationChunks('a'.repeat(2001)));assert.throws(()=>translationChunks('a'.repeat(221)));assert.throws(()=>translationChunks(' '));
 assert.deepEqual(translationChunks('ہم کل آئیں گے۔ کیا آپ تیار ہیں؟'),['ہم کل آئیں گے۔','کیا آپ تیار ہیں؟']);
});
test('number checks equate Urdu digits but flag missing amounts',()=>{
 assert.deepEqual(translationWarnings('Pay 600 at 3.', '۳ بجے ۶۰۰ ادا کریں۔','en'),[]);
 assert.ok(translationWarnings('Pay 600.', 'ساٹھ ادا کریں۔','en').some(x=>x.startsWith('Numbers')));
});
test('lost negation and wrong script are flagged without claiming semantic verification',()=>{
 assert.deepEqual(translationWarnings('تین لوگوں کے لیے قیمت کتنی ہے؟','What is the cost for three people?','ur'),[]);
 assert.ok(translationWarnings('Do not take photos.', 'تصاویر لیں۔','en').some(x=>x.startsWith('A negative')));
 assert.deepEqual(translationWarnings('Do not take photos.', 'تصاویر نہ لیں۔','en'),[]);
 assert.ok(translationWarnings('کیا قیمت ہے؟','کیا قیمت ہے؟','ur').length);
});
test('day and time checks flag changed details and retain a warning for mixed script',()=>{
 assert.ok(translationWarnings('Visit tomorrow morning.','آج صبح آئیں۔','en').some(x=>x.startsWith('The day')));
 assert.ok(translationWarnings('Meet at 3 pm.','3 بجے ملیں۔','en').some(x=>x.startsWith('AM')));
 assert.deepEqual(translationWarnings('Meet tomorrow at 3 pm.','کل دوپہر 3 بجے ملیں۔','en'),[]);
 assert.ok(translationWarnings('Visit the farm.','فARM دیکھیں۔','en').some(x=>x.startsWith('Some words')));
});
