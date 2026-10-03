// Creator resource library — curated source collections maintained by contributors
// in creator-hub/resources/collections.json (game-dev "awesome" lists bucketed by
// topic). These are indexed references, not installed dependencies or verified
// templates. We preserve each entry's provenance and its explicit
// native_ootle_compatibility flag (mapped to tariCompatible=null when not verified).

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { hubRoot } from '../paths.mjs';
import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';

const FILE = path.join(hubRoot, '..', 'resources', 'collections.json');
const LIBRARY_URL = 'https://github.com/marguerite347/ootle-lobby/tree/main/creator-hub/resources';

export const source = {
  id: 'creator-resource-library',
  name: 'Creator resource library (curated buckets)',
  kind: 'curated',
  canonicalUrl: LIBRARY_URL,
  ingestion: 'Local curated inventory (creator-hub/resources/collections.json)',
  native: false,
};

function compat(v) {
  if (v === 'verified' || v === true) return true;
  if (v === 'incompatible' || v === false) return false;
  return null; // "not_verified" and anything else => unknown
}

export async function fetchLive() {
  if (!existsSync(FILE)) {
    throw new Error(`curated collections file not found at ${FILE}`);
  }
  const doc = JSON.parse(readFileSync(FILE, 'utf8'));
  const items = Array.isArray(doc.collections) ? doc.collections : [];
  const records = items.map((c) => {
    const [owner] = (c.repository || '').split('/');
    return makeResource({
      id: `creative:learn:${slug(c.id || c.title)}`,
      type: 'learn',
      ecosystem: 'creative',
      title: c.title,
      summary: [c.summary, c.use_in_hub && `In the hub: ${c.use_in_hub}`].filter(Boolean).join(' — '),
      category: c.bucket || null,
      sourceUrl: c.source_url || null,
      repoUrl: c.source_url || (c.repository ? `https://github.com/${c.repository}` : null),
      docsUrl: c.source_url || null,
      readiness: c.archived ? 'deprecated' : 'conceptual',
      license: c.list_license && c.list_license !== 'unverified' ? c.list_license : null,
      tags: ['collection', 'game-dev', c.bucket].filter(Boolean),
      creator: owner ? { name: owner, url: `https://github.com/${owner}` } : null,
      attribution: `${c.title}${c.repository ? ` (${c.repository})` : ''} — curated in the Ootle Lobby source library`,
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: c.repository || c.id,
      upstreamRevision: c.source_revision || null,
      sourceUpdatedAt: c.last_commit_at || null,
      lastVerifiedAt: c.checked_on || null,
      freshness: 'provisional',
      verification: 'source-attested',
      tariCompatible: compat(c.native_ootle_compatibility),
      preview: c.repository ? { image: `https://opengraph.githubassets.com/1/${c.repository}`, video: null, source: 'GitHub social image' } : null,
    });
  });
  return { records };
}
