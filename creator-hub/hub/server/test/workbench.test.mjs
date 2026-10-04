import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createWorkbenchRouter} from '../workbench.mjs';
async function serve(services,fn){const app=express();app.use('/api/workbench',createWorkbenchRouter(services));const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));try{await fn(`http://127.0.0.1:${server.address().port}/api/workbench`);}finally{await new Promise(resolve=>server.close(resolve));}}
test('default backend never compiles, deploys, chats or publishes',()=>serve({},async base=>{
 const {capabilities}=await (await fetch(`${base}/capabilities`)).json();assert.ok(Object.values(capabilities).every(value=>value===false));
 for(const path of ['runs','deployments','assistant','publications']){const response=await fetch(`${base}/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,501);assert.equal((await response.json()).code,'NOT_CONNECTED');}
 assert.deepEqual(await (await fetch(`${base}/publications`)).json(),{items:[],connected:false});
}));
test('service seam carries the selected destination and returns review status unchanged',()=>serve({publish:async req=>{assert.equal(req.body.destination,'october-2026');return {status:'pending-review',submissionId:req.body.requestId,publication:null};},listPublications:async()=>({items:[]})},async base=>{
 const response=await fetch(`${base}/publications`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:'october-2026',requestId:'idempotent-1'})});assert.deepEqual(await response.json(),{status:'pending-review',submissionId:'idempotent-1',publication:null});assert.deepEqual(await(await fetch(`${base}/publications`)).json(),{items:[]});
}));
test('runner capabilities require both submission and polling services',()=>serve({run:async()=>({id:'job',status:'queued',logs:[]})},async base=>{
 const {capabilities}=await (await fetch(`${base}/capabilities`)).json();assert.equal(capabilities.compile,false);assert.equal(capabilities.test,false);
}));
