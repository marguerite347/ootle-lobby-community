import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recipeById, recipeSummaries, validateConfig, exportManifest, WASM_TEMPLATE_REV } from '../recipes.mjs';

const RECIPE = 'token-rewarded-counter';

test('recipe summaries and lookup, with pinned real component revisions', () => {
  const sums = recipeSummaries();
  assert.ok(sums.find((s) => s.id === RECIPE));
  const r = recipeById(RECIPE);
  assert.equal(r.engine, 'playcanvas');
  assert.equal(r.status, 'proposed'); // not a confirmed runnable choice
  assert.equal(r.verifiedTestnet, false);
  assert.equal(r.components.length, 2);
  assert.ok(r.components.every((c) => c.revision === WASM_TEMPLATE_REV), 'components pinned to a real revision');
});

test('valid config passes and fills defaults', () => {
  const r = recipeById(RECIPE);
  const res = validateConfig(r, { rewardPerIncrement: 5, tokenSymbol: 'GOLD' });
  assert.equal(res.ok, true);
  assert.equal(res.config.rewardPerIncrement, 5);
  assert.equal(res.config.tokenSymbol, 'GOLD');
  assert.equal(res.config.startCount, 0); // default filled
});

test('invalid parameters are rejected with explanations', () => {
  const r = recipeById(RECIPE);
  const out = validateConfig(r, { rewardPerIncrement: 99999, tokenSymbol: 'lower case!', unknownKey: 1 });
  assert.equal(out.ok, false);
  const fields = out.errors.map((e) => e.field);
  assert.ok(fields.includes('rewardPerIncrement'), 'out-of-range integer rejected');
  assert.ok(fields.includes('tokenSymbol'), 'bad pattern rejected');
  assert.ok(fields.includes('unknownKey'), 'unknown parameter rejected');
  assert.ok(out.errors.every((e) => typeof e.reason === 'string' && e.reason.length));
});

test('wrong type is rejected', () => {
  const r = recipeById(RECIPE);
  const out = validateConfig(r, { rewardPerIncrement: 'abc' });
  assert.equal(out.ok, false);
  assert.ok(out.errors.some((e) => e.field === 'rewardPerIncrement' && /integer/.test(e.reason)));
});

test('incompatible connection wiring is rejected and explained', () => {
  const bad = {
    id: 'bad', version: '0', schemaVersion: 1, engine: 'playcanvas', status: 'proposed',
    components: [{ name: 'counter', provides: ['count'], methods: [], requires: [] }],
    connections: [{ id: 'x', from: 'counter.count', to: 'ghost.input' }],
    parameters: [],
  };
  const out = validateConfig(bad, {});
  assert.equal(out.ok, false);
  assert.ok(out.errors.some((e) => /unknown component "ghost"/.test(e.reason)));
});

test('export manifest round-trips: parameters and version pins are preserved', () => {
  const r = recipeById(RECIPE);
  const manifest = exportManifest(r, { rewardPerIncrement: 7, tokenSymbol: 'PTS' });
  assert.equal(manifest.parameters.rewardPerIncrement, 7);
  assert.ok(manifest.components.every((c) => c.revision === WASM_TEMPLATE_REV));
  assert.equal(manifest.verifiedTestnet, false);
  // Reload: re-validating the exported parameters reproduces the same config.
  const reloaded = validateConfig(r, manifest.parameters);
  assert.equal(reloaded.ok, true);
  assert.deepEqual(reloaded.config, manifest.parameters);
});

test('export throws (with errors) on an invalid configuration', () => {
  const r = recipeById(RECIPE);
  assert.throws(() => exportManifest(r, { rewardPerIncrement: -1 }), (e) => e.status === 400 && Array.isArray(e.errors));
});


test('rejects malformed endpoints, wrong direction, types and unknown rules', () => {
  for (const connection of [
    {from:'counter',to:'fungible.amount',rule:'fixed-reward'},
    {from:'counter.count.extra',to:'fungible.amount',rule:'fixed-reward'},
    {from:'counter.count',to:'fungible.token',rule:'fixed-reward'},
    {from:'counter.count',to:'fungible.amount',rule:'unknown'},
    {from:'counter.count',to:'fungible.amount',rule:'identity'},
  ]) {
    const r=structuredClone(recipeById(RECIPE)); r.connections=[connection];
    assert.equal(validateConfig(r,{}).ok,false,JSON.stringify(connection));
  }
  assert.equal(validateConfig(recipeById(RECIPE),17).ok,false);
});
test('source references are pinned and export retains missing adapter requirements',()=>{
 const r=recipeById(RECIPE);
 assert.ok(r.components.every(c=>c.source.includes(`/tree/${WASM_TEMPLATE_REV}/`)));
 assert.ok(r.components[0].methods.includes('increase'));
 assert.ok(!r.components[0].methods.includes('increment'));
 assert.equal(exportManifest(r).adapter.status,'required-not-implemented');
 assert.ok(exportManifest(r).adapter.steps.includes('recipient.deposit(bucket)'));
});
