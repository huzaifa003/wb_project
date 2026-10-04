import test from 'node:test';
import assert from 'node:assert/strict';
import {validModelResponse} from '../src/model/validate-response.js';
test('rejects app fallback HTML and broken model JSON instead of caching them',async()=>{
 assert.equal(await validModelResponse(new Response('<html>app</html>',{headers:{'content-type':'text/html'}}),'config.json'),false);
 assert.equal(await validModelResponse(new Response('{broken'),'config.json'),false);
 assert.equal(await validModelResponse(new Response('missing',{status:404}),'model.onnx'),false);
 const response=new Response('{"model_type":"bert"}');
 assert.equal(await validModelResponse(response,'config.json'),true);
 assert.equal(response.bodyUsed,false);
});
