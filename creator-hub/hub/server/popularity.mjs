// Hub Popularity Signal — an aggregator standard.
//
// Problem: raw metrics from different sources are NOT comparable (a GitHub star, a
// ContentDB download, a forum read, a hub fork). TEMPLATE_MARKETPLACE.md is explicit:
// "avoid treating incomparable platform metrics as equivalent" and "give new listings
// a discovery path without fabricated popularity".
//
// Standard (v1):
//  1. Collect real signals per source (imported facts, kept with provenance).
//  2. Normalize each signal WITHIN its own metric using a log curve against a
//     disclosed reference value -> a 0..1 subscore. Different platforms are never
//     summed on their raw scales.
//  3. Group subscores into four dimensions (reach, adoption, momentum, engagement),
//     taking the strongest available signal per dimension.
//  4. Aggregate the AVAILABLE dimensions with disclosed weights -> 0..100 score.
//  5. Report confidence = how many dimensions had data (never hide sparse data).
//  6. Map to a plain tier and expose the single strongest native metric for thumbnails.
//
// Nothing is invented: a record with no signals is "New" (score null), which still
// gets a discovery path rather than a fake number.

export const STANDARD = {
  version: 1,
  dimensions: {
    reach: { weight: 0.35, label: 'Reach', desc: 'Audience size (GitHub stars, downloads, forum reads).' },
    adoption: { weight: 0.25, label: 'Adoption', desc: 'Derivation and reuse (forks / Riffs).' },
    momentum: { weight: 0.20, label: 'Momentum', desc: 'Recency of activity (last commit / update).' },
    engagement: { weight: 0.20, label: 'Engagement', desc: 'Community interest (hub stars, comments, watchers).' },
  },
  // Disclosed reference values: the raw value that maps to ~1.0 on the log curve.
  references: {
    githubStars: 10000,
    githubForks: 1000,
    githubWatchers: 1000,
    downloads: 100000,
    forumReads: 1000,
    forumScore: 1000,
    hubStars: 50,
    hubForks: 20,
    hubComments: 30,
  },
  momentumHalfLifeDays: 180, // activity this old scores ~0.5
  tiers: [
    { id: 'top', label: 'Top', min: 70 },
    { id: 'popular', label: 'Popular', min: 40 },
    { id: 'emerging', label: 'Emerging', min: 1 },
    { id: 'new', label: 'New', min: 0 },
  ],
};

function logNorm(x, ref) {
  if (!x || x <= 0) return 0;
  const v = Math.log10(1 + x) / Math.log10(1 + ref);
  return Math.max(0, Math.min(1, v));
}

function recency(dateIso) {
  if (!dateIso) return null;
  const then = Date.parse(dateIso);
  if (Number.isNaN(then)) return null;
  const days = (Date.now() - then) / 86400000;
  if (days < 0) return 1;
  // Exponential decay with the disclosed half-life.
  return Math.pow(0.5, days / STANDARD.momentumHalfLifeDays);
}

function fmtCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

/**
 * Compute the popularity signal for a record.
 * @param {object} signals  imported per-source signals (record.signals)
 * @param {object} engagement  live hub engagement { stars, comments, forks }
 */
export function computePopularity(signals = {}, engagement = {}) {
  const gh = signals.github || {};
  const cdb = signals.contentdb || {};
  const disc = signals.discourse || {};
  const R = STANDARD.references;

  // Candidate native metrics (for the thumbnail label), each with a normalized reach value.
  const natives = [];
  if (gh.stars != null) natives.push({ metric: `${fmtCount(gh.stars)}★`, source: 'GitHub', reach: logNorm(gh.stars, R.githubStars), raw: gh.stars });
  if (cdb.downloads != null) natives.push({ metric: `${fmtCount(cdb.downloads)}⤓`, source: 'ContentDB', reach: logNorm(cdb.downloads, R.downloads), raw: cdb.downloads });
  if (disc.reads != null) natives.push({ metric: `${fmtCount(disc.reads)} reads`, source: 'Forum', reach: logNorm(disc.reads, R.forumReads), raw: disc.reads });

  // Dimensions — strongest available signal per dimension.
  const dims = {};
  const contributions = [];

  const reachVals = [
    gh.stars != null && logNorm(gh.stars, R.githubStars),
    cdb.downloads != null && logNorm(cdb.downloads, R.downloads),
    disc.reads != null && logNorm(disc.reads, R.forumReads),
    disc.score != null && logNorm(disc.score, R.forumScore),
  ].filter((v) => v !== false);
  if (reachVals.length) { dims.reach = Math.max(...reachVals); contributions.push('reach'); }

  const adoptVals = [
    gh.forks != null && logNorm(gh.forks, R.githubForks),
    engagement.forks != null && logNorm(engagement.forks, R.hubForks),
  ].filter((v) => v !== false);
  if (adoptVals.length) { dims.adoption = Math.max(...adoptVals); contributions.push('adoption'); }

  const mom = recency(gh.pushedAt || engagement.updatedAt || null);
  if (mom != null) { dims.momentum = mom; contributions.push('momentum'); }

  const engVals = [
    engagement.stars != null && logNorm(engagement.stars, R.hubStars),
    engagement.comments != null && logNorm(engagement.comments, R.hubComments),
    gh.watchers != null && logNorm(gh.watchers, R.githubWatchers),
  ].filter((v) => v !== false);
  if (engVals.length) { dims.engagement = Math.max(...engVals); contributions.push('engagement'); }

  // Aggregate available dimensions with disclosed weights, rescaled by available weight.
  let weighted = 0;
  let availableWeight = 0;
  for (const [id, def] of Object.entries(STANDARD.dimensions)) {
    if (dims[id] != null) { weighted += dims[id] * def.weight; availableWeight += def.weight; }
  }
  const hasData = availableWeight > 0;
  const score = hasData ? Math.round((weighted / availableWeight) * 100) : null;

  const nContrib = contributions.length;
  const confidence = nContrib >= 4 ? 'high' : nContrib >= 2 ? 'medium' : nContrib >= 1 ? 'low' : 'none';

  const tier = (STANDARD.tiers.find((t) => (score ?? 0) >= t.min) || STANDARD.tiers[STANDARD.tiers.length - 1]);

  // Native metric for the thumbnail: strongest reach signal, else hub engagement.
  natives.sort((a, b) => b.reach - a.reach);
  let native = natives[0] || null;
  if (!native) {
    if (engagement.forks) native = { metric: `${engagement.forks} fork${engagement.forks === 1 ? '' : 's'}`, source: 'Hub' };
    else if (engagement.stars) native = { metric: `${engagement.stars}★ hub`, source: 'Hub' };
  }

  return {
    standardVersion: STANDARD.version,
    score,
    tier: tier.id,
    tierLabel: tier.label,
    confidence,
    dimensions: dims, // 0..1 per available dimension
    contributions,
    native, // { metric, source } or null (shown on the thumbnail)
    sources: dedupeSources(signals, engagement),
  };
}

function dedupeSources(signals, engagement) {
  const out = [];
  if (signals.github) out.push('GitHub');
  if (signals.contentdb) out.push('ContentDB');
  if (signals.discourse) out.push('Tari forum');
  if (engagement && (engagement.stars || engagement.comments || engagement.forks)) out.push('Ootle Lobby');
  return out;
}
