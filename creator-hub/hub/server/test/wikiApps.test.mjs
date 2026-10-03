import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchLive, parseDirectory, DIRECTORY } from '../connectors/wikiApps.mjs';
const directory = '# Community Application Directory\n|[ShadowTix](./shadowtix)|Testnet|Tickets|\n|[New App](./new_app)|Testnet|New|';
const page = '# ShadowTix\n**Website:** https://shadowtix.shop/\n**Github:** https://github.com/zvovanz-a1/tari-ticket-public\n**Short Description:** Tickets and check-in.\n**Project Status:** Not production-ready\n**Testnet:** Ootle Esmeralda';
test('wiki discovers new pages, keeps stable IDs, reads bold and plain Markdown fields', async () => {
  const {records} = await fetchLive({read: async u => u === DIRECTORY ? directory : u.endsWith('shadowtix') ? page : page.replaceAll('**', '')});
  assert.equal(records.length, 2);
  assert.equal(records[0].id, 'tari-ootle:app:shadowtix');
  assert.equal(records[1].id, 'tari-ootle:app:new-app');
  assert.equal(records[0].demoUrl, 'https://shadowtix.shop/');
  assert.equal(records[0].repoUrl, 'https://github.com/zvovanz-a1/tari-ticket-public');
  assert.match(records[0].summary, /Not production-ready/);
  assert.equal(records[0].provenance.sourceUpdatedAt, null);
  assert.equal(records[0].provenance.upstreamRevision.length, 64);
  assert.equal(records[0].readiness, 'conceptual');
  assert.equal(records[0].tariCompatible, null);
});
test('incomplete or changed wiki schema fails rather than publishing a partial directory', async () => {
  assert.throws(() => parseDirectory('<html>login</html>'), /no recognized/);
  assert.throws(() => parseDirectory('# Directory\n|[Bad](https://elsewhere.example)|Testnet|Bad|'), /no recognized/);
  await assert.rejects(fetchLive({read: async u => u === DIRECTORY ? directory : '# Empty'}), /no description/);
  await assert.rejects(fetchLive({read: async u => {if(u === DIRECTORY)return directory;throw new Error('offline');}}), /offline/);
});
test('content change produces a new revision hash', async () => {
  const load = text => fetchLive({read: async u => u === DIRECTORY ? directory : text});
  const a = await load(page); const b = await load(page.replace('Tickets and check-in.', 'Updated tickets.'));
  assert.notEqual(a.records[0].provenance.upstreamRevision,b.records[0].provenance.upstreamRevision);
});
