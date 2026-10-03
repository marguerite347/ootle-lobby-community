import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {createApp} from '../app.mjs';
import {clientPublic, clientDist} from '../paths.mjs';

const face = '/daily-spark/vault-disc/vault-disc-face.svg';
const faceFile = path.join(clientPublic, 'daily-spark', 'vault-disc', 'vault-disc-face.svg');

test('vault-disc plates serve as image/* from public (not SPA HTML)', async () => {
  assert.ok(existsSync(faceFile), 'committed public vault-disc-face.svg required');
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const res = await fetch(base + face);
    const type = res.headers.get('content-type') || '';
    const body = await res.text();
    assert.equal(res.status, 200);
    assert.match(type, /image\/svg\+xml/);
    assert.equal(/html/i.test(type), false);
    assert.ok(body.includes('<svg') || body.includes('<?xml'), 'svg body');
    assert.ok(!/<!doctype html>/i.test(body), 'must not be SPA index');

    const missing = await fetch(base + '/daily-spark/vault-disc/missing-plate.svg');
    const missingBody = await missing.text();
    assert.equal(missing.status, 404);
    assert.ok(!/<!doctype html>/i.test(missingBody), 'missing asset must not SPA to index.html');
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('public vault-disc pack present beside tip (build-copy source)', () => {
  const dir = path.join(clientPublic, 'daily-spark', 'vault-disc');
  for (const name of [
    'vault-disc-face.svg',
    'vault-disc-rim.svg',
    'vault-pointer-lime.svg',
    'vault-gateway-badge.svg',
    'vault-disc-rim@2x.png',
  ]) {
    assert.ok(existsSync(path.join(dir, name)), name);
  }
  void clientDist;
});
