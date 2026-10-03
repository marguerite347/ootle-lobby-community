import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
test('HTTP recipe routes reject explicit malformed config rather than default it',async()=>{
 const server=createApp().listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
 try {for(const action of ['validate','export']) for(const config of [false,0,'',null]) {
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/recipes/token-rewarded-counter/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config})});
 const body=await response.json(); if(action==='validate')assert.equal(body.ok,false);else assert.equal(response.status,400);
 }
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/recipes/token-rewarded-counter/export`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,200);
 }finally{await new Promise(r=>server.close(r));}
});
