import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloudReader } from '../growthCloud.mjs';
const bundle = { schemaVersion: 1, registry: {metrics: [{id: 'test'}]}, targets: {targets: []}, observations: {test: []}, collection: {completedAt: '2026-09-25T09:00:00Z', sources: {}} };

test('cloud requests use server auth, reuse cache and retain snapshot on delivery failure', async () => {
  let time = 0;
  let calls = 0;
  const read = createCloudReader({token: 'test-secret', now: () => time, fetcher: async (url, options) => {
    calls++;
    assert.ok(url.startsWith('https://api.github.com/'));
    assert.equal(options.headers.Authorization, 'Bearer test-secret');
    if (calls > 1) return {ok: false, status: 503};
    return {ok: true, json: async () => bundle};
  }});
  assert.equal((await read()).bundle.collection.completedAt, bundle.collection.completedAt);
  await read();
  assert.equal(calls, 1);
  time += 300001;
  const retained = await read();
  assert.equal(retained.bundle.collection.completedAt, bundle.collection.completedAt);
  assert.match(retained.delivery.error, /503/);
  assert.ok(!JSON.stringify(retained).includes('test-secret'));
});

test('unconfigured local preview never makes cloud requests', async () => {
  const read = createCloudReader({token: '', fetcher: () => assert.fail('No request expected')});
  assert.equal((await read()).delivery.mode, 'local');
});

test('configured reader fails visibly if first cloud response is malformed', async () => {
  const read = createCloudReader({token: 'test', fetcher: async () => ({ok: true, json: async () => ({})})});
  await assert.rejects(read, /Invalid cloud data contract/);
});
