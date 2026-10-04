// INTEGRATION_GAP[CFG-DATA] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-data.
// Credentials never leave the server. Local previews opt in explicitly.
const CLOUD_URL = 'https://api.github.com/repos/marguerite347/tari-growth/contents/metrics/cloud.json?ref=growth-data';
const CACHE_MS = 5 * 60 * 1000;

export function validateBundle(bundle) {
  if (bundle?.schemaVersion !== 1 || !Array.isArray(bundle.registry?.metrics) ||
      !Array.isArray(bundle.targets?.targets) || !bundle.observations ||
      !Number.isFinite(Date.parse(bundle.collection?.completedAt)) || !bundle.collection?.sources) {
    throw new Error('Invalid cloud data contract');
  }
  for (const metric of bundle.registry.metrics) {
    const records = bundle.observations[metric.id];
    if (!Array.isArray(records) || records.some(record => record.metric_id !== metric.id ||
        !Number.isFinite(Date.parse(record.fetched_at)) ||
        !['current', 'provisional', 'stale', 'failed', 'unavailable'].includes(record.quality_state) ||
        (record.value !== null && (typeof record.value !== 'number' || !Number.isFinite(record.value))))) {
      throw new Error('Invalid cloud observations');
    }
  }
  return bundle;
}

export function createCloudReader({ token = process.env.GROWTH_GITHUB_TOKEN, fetcher = fetch, now = Date.now } = {}) {
  let cached = null;
  let checkedAt = -Infinity;
  let error = null;
  let pending = null;
  async function refresh() {
    try {
      const response = await fetcher(CLOUD_URL, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw+json' },
        signal: AbortSignal.timeout(10000), redirect: 'error',
      });
      if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
      const bundle = validateBundle(await response.json());
      if (cached && Date.parse(bundle.collection.completedAt) < Date.parse(cached.collection.completedAt)) throw new Error('Cloud collection moved backwards');
      cached = bundle;
      error = null;
    } catch (failure) {
      error = failure.message;
    } finally { checkedAt = now(); pending = null; }
  }
  return async () => {
    if (!token) return { bundle: null, delivery: { mode: 'local' } };
    if (now() - checkedAt >= CACHE_MS) {
      pending ??= refresh();
      await pending;
    }
    if (!cached) throw Object.assign(new Error(`Cloud growth data unavailable: ${error}`), { status: 503 });
    return { bundle: structuredClone(cached), delivery: { mode: 'cloud', error } };
  };
}
