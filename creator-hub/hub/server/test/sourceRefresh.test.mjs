import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSourceRefresh } from '../sourceRefresh.mjs';
test('refresh is sequential, retries failures and stops scheduling when shut down', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  let calls=0, release; const errors=[];
  const stop=startSourceRefresh({intervalMs:60000,initialDelayMs:5,run:async()=>{calls++;if(calls===1)await new Promise(r=>release=r);else throw new Error('offline');},onError:e=>errors.push(e.message)});
  t.mock.timers.tick(5); assert.equal(calls,1);
  t.mock.timers.tick(120000); assert.equal(calls,1);
  release(); await Promise.resolve(); await Promise.resolve();
  t.mock.timers.tick(60000); await Promise.resolve(); await Promise.resolve();
  assert.equal(calls,2); assert.deepEqual(errors,['offline']);
  stop(); t.mock.timers.tick(120000); assert.equal(calls,2);
});
test('disable is explicit and invalid intervals are rejected',()=>{
  startSourceRefresh({intervalMs:0})();
  assert.throws(()=>startSourceRefresh({intervalMs:NaN}),/at least/);
  assert.throws(()=>startSourceRefresh({intervalMs:5}),/at least/);
});
