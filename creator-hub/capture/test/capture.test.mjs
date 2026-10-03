import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captureOne,validateApps} from '../capture-apps.mjs';
function mock(status=200){
 const stats={closed:0,deleted:0};const video={path:async()=>'/tmp/fake.webm',delete:async()=>stats.deleted++};
 const page={goto:async()=>({ok:()=>status<400,status:()=>status}),waitForTimeout:async()=>{},mouse:{wheel:async()=>{}},evaluate:async()=>{},video:()=>video};
 return {stats,browser:{newContext:async()=>({newPage:async()=>page,close:async()=>stats.closed++})}};
}
test('reject HTTP error pages and clean recording/context',async()=>{const m=mock(404);assert.equal(await captureOne(m.browser,{name:'x',url:'https://example.com'},'/tmp',()=>{throw Error('must not transcode');}),null);assert.deepEqual(m.stats,{closed:1,deleted:1});});
test('poster failure marks capture failed; success needs both encodes',async()=>{
 const m=mock();let calls=0;assert.equal(await captureOne(m.browser,{name:'capture-test-nonexistent'},'/tmp',()=>({status:++calls===2?1:0})),null);assert.equal(calls,2);assert.equal(m.stats.deleted,1);
 const n=mock();assert.equal(await captureOne(n.browser,{name:'capture-test-nonexistent'},'/tmp',()=>({status:0})),'/tmp/capture-test-nonexistent.mp4');assert.equal(n.stats.closed,1);
});
test('validate URLs and prevent overwritten or empty output names',()=>{
 for(const apps of [[{name:'x',url:'file:///etc/passwd'}],[{name:'x',url:'https://u:p@example.com'}],[{name:'🎮',url:'https://example.com'}],[{name:'a.b',url:'https://example.com'},{name:'a b',url:'https://example.com'}]])assert.throws(()=>validateApps(apps));
 assert.equal(validateApps([{name:'Game',url:'https://example.com'}]).length,1);
});

test('encoding trims the tour from the recording tail and removes audio',async()=>{
 const m=mock();const calls=[];
 await captureOne(m.browser,{name:'capture-options'},'/tmp',(cmd,args)=>{calls.push(args);return {status:0};});
 const args=calls[0];assert.equal(args[args.indexOf('-sseof')+1],'-12');
 assert.equal(args[args.indexOf('-t')+1],'12');assert.ok(args.includes('-an'));
 assert.equal(args[args.indexOf('-c:v')+1],'libx264');
});
