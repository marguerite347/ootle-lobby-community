import { readFileSync } from 'node:fs';
import { makeResource } from '../model.mjs';
export const source = { id: 'game-starters', name: 'Game foundations (curated)', kind: 'curated', canonicalUrl: 'https://github.com/topics/incremental-game', ingestion: 'Reviewed source links in creator-hub/resources/game-starters.json; no automatic execution', native: false };
export async function fetchLive() {
 const entries = JSON.parse(readFileSync(new URL('../../../resources/game-starters.json', import.meta.url), 'utf8'));
 return { records: entries.map(e => makeResource({
  ...e, id: `creative:${e.type}:${e.slug}`, ecosystem: 'creative', sourceId: source.id, sourceName: source.name,
  sourceUrl: e.repoUrl, docsUrl: e.docsUrl || e.repoUrl, category: e.category,
  upstreamId: e.repoUrl, lastVerifiedAt: '2026-09-21', freshness: 'provisional', verification: 'source-attested',
  readiness: 'conceptual', tariCompatible: null,
  preview: { image: `https://opengraph.githubassets.com/1/${e.repoUrl.replace('https://github.com/', '')}`, video: null, source: 'Repository social preview, not gameplay' },
 })) };
}
