import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accentFor, monogram, hashString } from '../src/cover.mjs';
import { appCoverSchema } from '../src/schemas.mjs';

test('accentFor is deterministic and a valid hex', () => {
  assert.equal(accentFor('SOOON FUN'), accentFor('SOOON FUN'));
  assert.match(accentFor('LabyrinthOS'), /^#[0-9a-f]{6}$/);
  assert.notEqual(accentFor('Sapient'), accentFor('ShadowTix'));
});

test('monogram takes initials of two words, else first two chars', () => {
  assert.equal(monogram('SOOON FUN'), 'SF');
  assert.equal(monogram('Tari Ootle Playground'), 'TO');
  assert.equal(monogram('LabyrinthOS'), 'LA');
  assert.equal(monogram('Sapient'), 'SA');
  assert.equal(monogram('!!!'), '?');
});

test('hashString is stable', () => {
  assert.equal(hashString('Caravel'), hashString('Caravel'));
});

test('appCoverSchema defaults format to 1:1 and duration to 4', () => {
  const p = appCoverSchema.parse({ name: 'Sapient' });
  assert.equal(p.format, '1:1');
  assert.equal(p.durationInSeconds, 4);
});

test('appCoverSchema rejects an empty name and an over-long name', () => {
  assert.equal(appCoverSchema.safeParse({ name: '' }).success, false);
  assert.equal(appCoverSchema.safeParse({ name: 'x'.repeat(41) }).success, false);
});

test('short accent hex expands before alpha suffixes; colliding output names rejected',async()=>{
 const {fullHex,coverSlugs}=await import('../src/cover.mjs');
 assert.equal(fullHex('#f00'),'#ff0000');assert.equal(fullHex('#123456'),'#123456');
 assert.throws(()=>coverSlugs([{name:'App.One'},{name:'App One'}]));assert.throws(()=>coverSlugs([{name:'🎮'}]));
 assert.deepEqual(coverSlugs([{name:'Game One'},{name:'Game Two'}]),['game-one','game-two']);
});
