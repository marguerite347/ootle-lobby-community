// Poly Haven — first live asset connector (CH-019).
//
// Public read-only API (https://polyhaven.com/our-api), CC0 assets. We link out to
// source-hosted asset pages and downloads (no binary mirroring) and use the provider's
// own preview thumbnails. Records carry provider + author attribution and the upstream
// files_hash as the revision so refreshes are idempotent and deletions drop cleanly via
// ingest's last-good retention. The full metadata catalog is indexed.

import { getJson, slug } from './http.mjs';
import { makeResource } from '../model.mjs';

const API = 'https://api.polyhaven.com';
const SITE = 'https://polyhaven.com';

const TYPE_NAME = { 0: 'hdri', 1: 'texture', 2: 'model' };

export const source = {
  id: 'polyhaven',
  name: 'Poly Haven',
  kind: 'rest',
  canonicalUrl: SITE,
  ingestion: 'Poly Haven public API (all CC0 assets, link-out; no mirroring)',
  native: false,
};

// A real Poly Haven asset entry is an object keyed by a slug id, with a known type
// (0 hdri / 1 texture / 2 model) and a name. Anything else (an `error` field, a
// string value, missing type) is rejected so it never becomes a listing.
function isValidAsset(id, m) {
  return typeof id === 'string' && id.length > 0
    && m && typeof m === 'object' && !Array.isArray(m)
    && typeof m.type === 'number' && TYPE_NAME[m.type] !== undefined
    && typeof m.name === 'string' && m.name.length > 0;
}

export async function fetchLive() {
  const all = await getJson(`${API}/assets`, { timeoutMs: 15000 });
  // Reject malformed / error / non-map payloads so ingest keeps the last-good source
  // instead of replacing it with zero (or fabricated) records.
  if (!all || typeof all !== 'object' || Array.isArray(all)) {
    throw new Error('Poly Haven payload is not an asset map');
  }
  if (all.error !== undefined) {
    throw new Error(`Poly Haven API error: ${String(all.error).slice(0, 120)}`);
  }

  // Full catalog, sorted by most recent across Poly Haven's real asset types (HDRI/texture/model).
  const valid = Object.entries(all).filter(([id, m]) => isValidAsset(id, m));
  if (valid.length === 0) {
    // Poly Haven always has assets; an empty/invalid catalog is treated as a failure so
    // last-good retention is invoked rather than publishing an empty source.
    throw new Error('Poly Haven returned no valid assets');
  }
  const entries = valid
    .sort((a, b) => (b[1]?.date_published || 0) - (a[1]?.date_published || 0));

  const records = entries.map(([id, m]) => {
    const kind = TYPE_NAME[m.type] || 'asset';
    const authors = m.authors ? Object.keys(m.authors) : [];
    const page = `${SITE}/a/${id}`;
    return makeResource({
      id: `polyhaven:asset:${slug(id)}`,
      type: 'asset', assetKind: 'asset', access: 'free',
      ecosystem: 'creative',
      title: m.name || id,
      summary: `Free CC0 ${kind} from Poly Haven${m.categories?.length ? ` (${m.categories.join(', ')})` : ''}. Download from the source page; no redistribution of binaries by the hub.`,
      category: kind,
      sourceUrl: page,
      docsUrl: `${SITE}/our-api`,
      demoUrl: page,
      readiness: 'runnable-example',
      license: 'CC0',
      prerequisites: [],
      tags: ['asset', 'poly-haven', kind, ...(m.categories || []), ...(m.tags || [])].slice(0, 10),
      creator: authors.length ? { name: authors.join(', '), url: `${SITE}/all?a=${encodeURIComponent(authors[0])}` } : { name: 'Poly Haven', url: SITE },
      attribution: `${m.name || id} by ${authors.join(', ') || 'Poly Haven'} — Poly Haven (CC0)`,
      sourceId: source.id,
      sourceName: source.name,
      upstreamId: id,
      upstreamUrl: page,
      upstreamRevision: m.files_hash || null,
      sourceUpdatedAt: m.date_published ? new Date(m.date_published * 1000).toISOString() : null,
      lastVerifiedAt: new Date().toISOString().slice(0, 10),
      freshness: 'current',
      verification: 'source-attested',
      tariCompatible: null,
      setupHint: `Download from ${page} (CC0). Compose it into a project in the Studio.`,
      preview: { image: `https://cdn.polyhaven.com/asset_img/thumbs/${id}.png?height=360`, video: null, source: 'Poly Haven thumbnail' },
    });
  });
  return { records };
}
