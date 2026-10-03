import { readFileSync } from 'node:fs';
import path from 'node:path';
import { hubRoot } from '../paths.mjs';
import { makeResource } from '../model.mjs';
export const source = { id: 'creator-references', name: 'Creator tools and learning references', kind: 'curated',
  canonicalUrl: 'https://github.com/marguerite347/ootle-lobby/tree/main/creator-hub/resources',
  ingestion: 'Reviewed individual resource inventory; editorial dates are not live upstream checks', native: false };
export async function fetchLive() {
  const { resources } = JSON.parse(readFileSync(path.join(hubRoot, '../resources/references.json'), 'utf8'));
  return { records: resources.map(r => makeResource({
    id: `creative:${r.type}:${r.id}`, type: r.type, ecosystem: 'creative', title: r.title,
    summary: `${r.summary} ${r.use_in_hub}`, category: r.bucket,
    sourceUrl: r.source_url, docsUrl: r.source_url, repoUrl: r.repository ? `https://github.com/${r.repository}` : null,
    creator: r.repository ? { name: r.repository.split('/')[0], url: `https://github.com/${r.repository.split('/')[0]}` } : null,
    tags: [r.bucket, ...r.tags], format: r.format, license: r.license,
    readiness: 'conceptual', verification: 'source-attested', freshness: 'provisional', lastVerifiedAt: r.checked_on,
    sourceId: source.id, sourceName: source.name, upstreamId: r.id,
    attribution: 'Linked to its original creator; reviewed in the Ootle Lobby resource library.',
  })) };
}
