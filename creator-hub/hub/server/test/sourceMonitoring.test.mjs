import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkRepository,extractLinks,startSourceMonitoring,monitoringStatus,repositories} from '../sourceMonitoring.mjs';
const reply=(sha,body)=>async url=>url.endsWith('/readme')?{sha,encoding:'base64',content:Buffer.from(body).toString('base64')}:{pushed_at:'2026-09-20T00:00:00Z',archived:false};
test('first check is a baseline; later changes retain explicit added and removed links',async()=>{
 const baseline=await checkRepository('owner/repo',null,{request:reply('a','[Old](https://example.com/old)'),now:'2026-09-21T00:00:00Z'});
 assert.equal(baseline.changes,null);
 const changed=await checkRepository('owner/repo',baseline,{request:reply('b','[New](https://example.com/new)'),now:'2026-09-22T00:00:00Z'});
 assert.deepEqual(changed.changes.added,['https://example.com/new']);
 assert.deepEqual(changed.changes.removed,['https://example.com/old']);
 const unchanged=await checkRepository('owner/repo',changed,{request:reply('b','[New](https://example.com/new)')});
 assert.deepEqual(unchanged.changes,changed.changes);
});
test('failed checks preserve the last successful baseline and diff',async()=>{
 const previous={sha:'a',links:['https://example.com'],lastSuccessAt:'2026-09-20T00:00:00Z'};
 const failed=await checkRepository('owner/repo',previous,{request:async()=>{throw Error('HTTP 403');}});
 assert.equal(failed.lastSuccessAt,previous.lastSuccessAt);assert.deepEqual(failed.links,previous.links);assert.equal(failed.error,'HTTP 403');
});
test('known lists and skill workflows are included without duplicates',()=>{
 assert.ok(repositories.includes('Calinou/awesome-godot'));assert.ok(repositories.includes('huggingface/skills'));
 assert.equal(repositories.length,new Set(repositories).size);
 assert.deepEqual(extractLinks('https://a.test https://a.test javascript:bad'),['https://a.test']);
});
test('schedule is non-overlapping, stoppable and explicitly disabled',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let calls=0,finish;
 const stop=startSourceMonitoring({intervalMs:60000,initialDelayMs:5,run:async()=>{calls++;await new Promise(r=>finish=r);}});
 t.mock.timers.tick(5);assert.equal(calls,1);t.mock.timers.tick(120000);assert.equal(calls,1);
 finish();await Promise.resolve();await Promise.resolve();stop();t.mock.timers.tick(120000);assert.equal(calls,1);
 startSourceMonitoring({intervalMs:0})();assert.equal(monitoringStatus().enabled,false);
 assert.throws(()=>startSourceMonitoring({intervalMs:1}));
});
