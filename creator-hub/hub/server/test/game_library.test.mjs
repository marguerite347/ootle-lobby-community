import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gameLibrary } from '../gameLibrary.mjs';
import { fetchLive } from '../connectors/gameStarters.mjs';
import * as catalog from '../catalog.mjs';
import { createApp } from '../app.mjs';

test('game foundations keep mods and reference candidates distinct from starters', async () => {
 const {records} = await fetchLive(); const lib = gameLibrary(records);
 assert.equal(lib.items.find(r=>r.title.includes('SMODS')).kind,'mod');
 assert.equal(lib.items.find(r=>r.title==='Balatro-style Godot prototype').kind,'reference');
 assert.equal(lib.items.find(r=>r.title==='Deckbuilder Framework').kind,'framework');
 assert.equal(lib.items.find(r=>r.title==='The Modding Tree').genres.includes('incremental'),true);
 for (const r of records) { assert.equal(r.tariCompatible,null); assert.equal(r.provenance.freshness,'provisional'); assert.ok(r.setupHint); }
});

test('genre projection preserves catalog IDs, existing starters and count consistency', () => {
 const {records} = JSON.parse(readFileSync(new URL('../../data/seed/catalog.json',import.meta.url)));
 const lib = gameLibrary(records);
 for(const r of records.filter(r=>['starter','component'].includes(r.type))) assert.ok(lib.items.find(x=>x.id===r.id));
 for(const g of lib.genres) assert.equal(g.count,lib.items.filter(r=>r.genres.includes(g.id)).length);
 assert.ok(lib.items.some(r=>r.ecosystem==='gdevelop' && r.genres.includes('racing')));
 assert.ok(lib.items.some(r=>r.ecosystem==='luanti' && r.genres.includes('voxel')));
});

test('HTTP library selections resolve to canonical resource details', async () => {
 catalog.load(); const server=createApp().listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
 try {
  const base=`http://127.0.0.1:${server.address().port}`;
  const lib=await (await fetch(base+'/api/game-starters')).json();
  assert.ok(lib.items.length>0);
  for(const r of lib.items.filter(r=>r.provenance.sourceId==='game-starters')) {
   const detail=await fetch(base+'/api/resources/'+encodeURIComponent(r.id)); assert.equal(detail.status,200); assert.equal((await detail.json()).id,r.id);
  }
 } finally { await new Promise(r=>server.close(r)); }
});
