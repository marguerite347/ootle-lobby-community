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

test('rejects invalid crop dimensions rather than silently discarding content',()=>{
 for(const cropBottom of [-2,1,162,'80'])assert.throws(()=>validateApps([{name:'source',url:'https://example.com',cropBottom}]));
 assert.equal(validateApps([{name:'source',url:'https://example.com',cropBottom:80}]).length,1);
});

// Interactive captures must fail closed when a reviewed control is missing.
test('interactive capture cleans up when a requested button is unavailable', async()=>{
 const m=mock();
 assert.equal(await captureOne(m.browser,{name:'missing-button',steps:[{button:'PLAY',holdMs:12000}]},'/tmp',()=>{throw Error('must not transcode')}),null);
 assert.deepEqual(m.stats,{closed:1,deleted:1});
});
test('interactive capture configuration is bounded',()=>{
 const app={name:'demo',url:'https://example.com'};
 for(const steps of [[],[{button:'',holdMs:12000}],[{button:'PLAY',holdMs:100}],[{button:'PLAY',holdMs:10000}],[...Array(8)].map(()=>({button:'PLAY',holdMs:10000}))])assert.throws(()=>validateApps([{...app,steps}]));
 assert.equal(validateApps([{...app,steps:[{button:'PLAY',holdMs:6000},{button:'START',holdMs:6000}]}]).length,1);
});
