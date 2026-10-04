import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewTranslation} from '../src/translation-review.js';
test('review keeps the original words and first draft with model provenance',()=>{
 const m={original_text:'تین لوگوں کے لیے قیمت کتنی ہے؟',translated_text:'What is the price for these logos?',translation_status:'machine',translation_meta:{model:'test'}};
 const checked=reviewTranslation(m,'What is the price for three people?',true,'2026-10-04T00:00:00Z');
 assert.equal(checked.original_text,m.original_text);assert.deepEqual(checked.translation_meta,m.translation_meta);
 assert.equal(checked.translation_status,'reviewed');assert.equal(checked.translation_review.previousText,m.translated_text);
 assert.equal(reviewTranslation(checked,'How much for three people?',true).translation_review.previousText,m.translated_text);
 assert.equal(m.translation_status,'machine');
});
test('review requires speaker confirmation, a usable result and no in-flight translation',()=>{
 assert.throws(()=>reviewTranslation({},'Hello',false));assert.throws(()=>reviewTranslation({},' ',true));
 assert.throws(()=>reviewTranslation({},'x'.repeat(2001),true));assert.throws(()=>reviewTranslation({translation_status:'pending'},'Hello',true));
});
