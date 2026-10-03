// Creator asset providers — curated registry maintained by contributors in
// creator-hub/resources/asset-providers.json (Poly Haven, ambientCG, Kenney, ...).
// These directory entries complement the individual Poly Haven, ambientCG and
// Kenney connectors. Other providers remain source links, not API integrations.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { hubRoot } from '../paths.mjs';
import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';

const FILE = path.join(hubRoot, '..', 'resources', 'asset-providers.json');
const LIBRARY_URL = 'https://github.com/marguerite347/ootle-lobby/tree/main/creator-hub/resources';

export const source = {
  id: 'asset-providers',
  name: 'Creator asset providers',
  kind: 'curated',
  canonicalUrl: LIBRARY_URL,
  ingestion: 'Local curated registry (creator-hub/resources/asset-providers.json)',
  native: false,
};

function pretty(id) {
  const special = { 'poly-haven': 'Poly Haven', ambientcg: 'ambientCG', kenney: 'Kenney', blendkit: 'BlendKit' };
  return special[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function fetchLive() {
  if (!existsSync(FILE)) throw new Error(`asset-providers file not found at ${FILE}`);
  const doc = JSON.parse(readFileSync(FILE, 'utf8'));
  const items = Array.isArray(doc.providers) ? doc.providers : [];
  const records = items.map((p) => {
    const title = pretty(p.id);
    const types = (p.asset_types || []).join(', ');
    const summary = [
      types && `Assets: ${types}.`,
      p.asset_license && `License: ${p.asset_license}.`,
      p.notes,
    ].filter(Boolean).join(' ');
    // Only treat a clean license as free-to-use; caveated strings stay as notes, not a license grant.
    const cleanLicense = /^(cc0|mit|apache|cc-by)/i.test(p.asset_license || '') && !/confirm|per_asset|unverified/i.test(p.asset_license || '') ? p.asset_license : null;
    return makeResource({
      id: `creative:asset:${slug(p.id)}`,
      type: 'asset',
      ecosystem: 'creative',
      title,
      summary: summary || null,
      category: 'asset-provider',
      sourceUrl: p.url || null,
      docsUrl: p.docs_url || p.terms_url || p.url || null,
      readiness: 'conceptual', // provider directory entry; individual catalogs use separate connectors
      license: cleanLicense,
      prerequisites: [],
      tags: ['asset', 'creative', 'asset-pack', ...(p.asset_types || [])].slice(0, 8),
      attribution: `${title} — asset provider (${p.asset_license || 'license unverified'})`,
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: p.id,
      upstreamUrl: p.url,
      sourceUpdatedAt: null,
      lastVerifiedAt: doc.checked_on || null,
      freshness: 'provisional',
      verification: 'source-attested',
      tariCompatible: null,
    });
  });
  return { records };
}
