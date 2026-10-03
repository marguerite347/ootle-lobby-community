import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generationOptions, generate } from '../scripts/generate-hf.mjs';

test('billed requests require opt-in and bounded valid parameters', () => {
  assert.throws(() => generationOptions(['--prompt','test']), /allow-paid/);
  for (const extra of [['--steps','NaN'],['--width','100000'],['--model','foo/../../bar'],['--height','257']]) {
    assert.throws(() => generationOptions(['--allow-paid','--prompt','test',...extra]));
  }
});
test('provider errors are not retried and do not expose response content', async () => {
  let calls = 0;
  await assert.rejects(generate({ out: '/tmp/unused-test-generation.png', model: 'a/b', prompt: 'test', parameters: {} }, 'fake', async () => {
    calls++; return new Response('private provider payload', { status: 503 });
  }), /HTTP 503/);
  assert.equal(calls, 1);
});
test('generation writes immutable output and honest provenance', async () => {
  const dir = mkdtempSync(path.join(tmpdir(),'tari-hf-test-'));
  try {
    const out = path.join(dir,'nested/test.png');
    const png = readFileSync(new URL('../public/placeholder-bg.png', import.meta.url));
    const fake = async () => new Response(png, { headers: { 'content-type': 'image/png' } });
    const options = { out, model: 'a/b', prompt: 'test', parameters: {} };
    await generate(options, 'fake', fake);
    const record = JSON.parse(readFileSync(`${out}.provenance.json`));
    assert.equal(record.modelRevision, null);
    assert.equal(record.sha256.length,64);
    await assert.rejects(generate(options,'fake',fake),/Output exists/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
