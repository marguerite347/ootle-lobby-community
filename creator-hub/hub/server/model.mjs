import {safeHref} from '../shared/safeLinks.mjs';
// Canonical Creator Hub records.
//
// The field contract follows creator-hub/TEMPLATE_MARKETPLACE.md and CREATOR_HUB.md:
// every entry carries a stable id, provenance (source + upstream revision + fetch
// time), readiness, verification and freshness. Imported facts are kept separate
// from community/editorial annotations so a refresh never overwrites curation.

export const SCHEMA_VERSION = 1;

// Resource kinds a creator can discover (TEMPLATE_MARKETPLACE.md information architecture).
export const RESOURCE_TYPES = [
  'starter', // complete runnable starter project
  'component', // reusable mechanic
  'recipe', // documented combination of components
  'app', // community-built application (Explore)
  'integration', // optional external service
  'asset', // art/audio/ui pack, editor or tool
  'learn', // walkthrough / skill / education
];

// Ecosystems are recorded independently of type. Native Ootle stays visibly
// distinct from external engines (CREATOR_HUB.md content requirements).
export const ECOSYSTEMS = {
  'tari': {label:'Tari L1',native:true,environment:'Tari L1'},
  'huggingface': {label: 'Hugging Face', native: false, environment: 'External AI ecosystem'},
  'tari-ootle': { label: 'Tari Ootle', native: true, environment: 'Ootle L2 (testnet)' },
  'gdevelop': { label: 'GDevelop', native: false, environment: 'GDevelop engine' },
  'luanti': { label: 'Luanti', native: false, environment: 'Luanti engine' },
  'playcanvas': { label: 'PlayCanvas', native: false, environment: 'PlayCanvas web engine' },
  'creative': { label: 'Creative / cross-engine', native: false, environment: 'Cross-engine' },
};

// Readiness never implies production. Network is recorded separately.
export const READINESS = ['conceptual', 'runnable-example', 'tested-release', 'deprecated'];

// Verification state of the facts we present about a record.
export const VERIFICATION = ['unverified', 'source-attested', 'hub-verified'];

// Freshness of the last successful source read.
export const FRESHNESS = ['current', 'provisional', 'stale', 'unavailable', 'failed'];

/**
 * Build a canonical resource record. Imported source facts live at the top level;
 * community/editorial fields live under `editorial` and are never written by
 * ingestion. Unknown fields are recorded explicitly as null, not guessed.
 */
export function makeResource(input) {
  const now = new Date().toISOString();
  const ecosystem = input.ecosystem in ECOSYSTEMS ? input.ecosystem : 'creative';
  return {
    ...(input.assetKind ? { assetKind: input.assetKind } : {}),
    ...(input.access ? { access: input.access } : {}),
    schemaVersion: SCHEMA_VERSION,
    id: input.id, // stable internal id, e.g. "tari-ootle:app:sooon-fun"
    type: RESOURCE_TYPES.includes(input.type) ? input.type : 'app',
    ecosystem,
    native: ECOSYSTEMS[ecosystem].native,

    title: input.title,
    cardSummary: input.cardSummary || null,
    cardStatus: input.cardStatus || null,
    summary: input.summary || null, // concise imported/source-attested purpose
    audience: input.audience || null,

    // Link out by default (CREATOR_HUB.md). Any of these may be null (unknown).
    sourceUrl: safeHref(input.sourceUrl) || null,
    discussionLinks: (input.discussionLinks || []).filter(p => safeHref(p.url)?.startsWith('https:')).map(p => ({url:safeHref(p.url),platform:p.platform})),
    repoUrl: safeHref(input.repoUrl) || null,
    docsUrl: safeHref(input.docsUrl) || null,
    demoUrl: safeHref(input.demoUrl) || null,

    network: input.network || null, // e.g. "Ootle testnet (Esmeralda)"; null if n/a
    readiness: READINESS.includes(input.readiness) ? input.readiness : 'conceptual',
    license: input.license || null, // unknown license is NOT free-to-use
    prerequisites: input.prerequisites || [],
    setupHint: input.setupHint || null, // concise "how to start" command/step, if known
    compatibility: input.compatibility || [], // tested compat evidence; [] = unknown
    tags: dedupe(input.tags || []),
    category: input.category || null,

    // Learn/education classification (used by the Learn section; null for non-learn).
    topic: input.topic || null, // primary creator goal (for display)
    topics: dedupe(input.topics && input.topics.length ? input.topics : (input.topic ? [input.topic] : [])), // all goal associations (one canonical record can serve several)
    level: input.level || null, // beginner | intermediate | advanced
    format: input.format || null, // guide | walkthrough | reference | video | api

    creator: input.creator || null, // { name, url } attribution of the upstream author
    attribution: input.attribution || null, // human-readable credit string

    // Provenance / source observation (TEMPLATE_MARKETPLACE.md canonical records).
    provenance: {
      sourceId: input.sourceId, // connector id
      sourceName: input.sourceName || input.sourceId,
      upstreamId: input.upstreamId || null,
      upstreamUrl: input.sourceUrl || input.upstreamUrl || null,
      upstreamRevision: input.upstreamRevision || null,
      sourceUpdatedAt: input.sourceUpdatedAt || null,
      fetchedAt: input.fetchedAt || now,
      freshness: FRESHNESS.includes(input.freshness) ? input.freshness : 'current',
    },

    verification: VERIFICATION.includes(input.verification) ? input.verification : 'unverified',
    lastVerifiedAt: input.lastVerifiedAt || null,

    // Raw popularity signals collected from the upstream source (imported facts).
    // Each is namespaced by origin so the aggregator can normalize per-source and
    // disclose provenance. Missing signals stay absent (never invented).
    signals: input.signals || {},

    // Preview media for game-like tiles/carousels. Only real, source-provided media
    // is used (a ContentDB thumbnail, a repo social image, or an actual clip URL).
    // When absent, the UI renders a styled placeholder — never a faked screenshot.
    preview: input.preview || null, // { image: url|null, video: url|null, source: string }

    // Compatibility with Tari/Ootle is a separate claim requiring its own evidence.
    tariCompatible: input.tariCompatible === true ? true : (input.tariCompatible === false ? false : null),

    // Editorial / community layer — never populated by ingestion.
    editorial: input.editorial || {
      description: null,
      collections: [],
      tags: [],
      spotlight: false,
      moderation: null,
    },

    relationships: input.relationships || [], // typed edges: remixes / depends-on / used-by
  };
}

export function dedupe(list) {
  return Array.from(new Set((list || []).filter(Boolean).map((s) => String(s))));
}

// A source registry entry records connector identity and last-read freshness so the
// UI can show "last checked / where it came from" and mark stale coverage.
export function makeSource(input) {
  return {
    id: input.id,
    name: input.name,
    kind: input.kind, // 'discourse' | 'github' | 'rest' | 'curated'
    canonicalUrl: input.canonicalUrl,
    ingestion: input.ingestion, // human description of how it is read
    native: input.native === true,
    lastAttemptAt: input.lastAttemptAt || null,
    lastSuccessAt: input.lastSuccessAt || null,
    freshness: input.freshness || 'unavailable',
    recordCount: input.recordCount || 0,
    note: input.note || null,
  };
}
