import {makeResource} from './model.mjs';

export const HF_ORIGIN = 'https://huggingface.co';
export const HF_KINDS = ['models', 'datasets', 'spaces'];
export const hfSource = {id: 'huggingface', name: 'Hugging Face creator collection', kind: 'rest', canonicalUrl: HF_ORIGIN, native: false, ingestion: 'Selected creator resources refreshed from public Hub metadata; live search covers public models, datasets and Spaces.', note: 'Curated subset, not a mirror of the entire Hub. Listed resources are not installed or Tari-verified.'};
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?$/.test(value) && !value.split('/').some(part => part === '.' || part === '..');
const badRequest = message => Object.assign(new Error(message), {status: 400});

export function normalizeHuggingFace(item, kind) {
  if (!HF_KINDS.includes(kind) || !validId(item?.id) || item.private === true) throw Error('Invalid public Hugging Face resource');
  const tags = Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : [];
  const license = typeof item.cardData?.license === 'string' ? item.cardData.license : tags.find(tag => tag.startsWith('license:'))?.slice(8) || null;
  const url = `${HF_ORIGIN}/${kind === 'models' ? '' : kind + '/'}${item.id}`;
  const task = typeof item.pipeline_tag === 'string' ? item.pipeline_tag : kind === 'spaces' ? 'Interactive AI demo' : kind === 'datasets' ? 'Dataset' : 'AI model';
  return makeResource({id: `huggingface:${kind}:${item.id}`, type: kind === 'spaces' ? 'app' : 'asset', ecosystem: 'huggingface', title: item.id, summary: `${task.replaceAll('-', ' ')} · ${item.gated ? 'Access conditions apply. ' : ''}Review the source card for capabilities, requirements and usage terms.`, category: kind, assetKind: kind === 'models' ? 'model' : kind === 'datasets' ? 'dataset' : 'tool', sourceUrl: url, repoUrl: url, docsUrl: url, demoUrl: kind === 'spaces' ? url : null, license, tags: ['hugging-face', kind, task, ...tags], creator: {name: item.author || item.id.split('/')[0], url: `${HF_ORIGIN}/${encodeURIComponent(item.id.split('/')[0])}`}, sourceId: hfSource.id, sourceName: 'Hugging Face', upstreamId: item.id, upstreamRevision: typeof item.sha === 'string' ? item.sha : null, sourceUpdatedAt: item.lastModified || null, verification: 'source-attested', readiness: 'conceptual', prerequisites: ['Review the model, dataset or Space card. Hardware, gating, paid inference and asset terms vary.'], signals: {huggingface: {likes: Number.isFinite(item.likes) ? item.likes : null, downloads: Number.isFinite(item.downloads) ? item.downloads : null}}});
}

export async function readHuggingFace(url) {
  const response = await fetch(url, {signal: AbortSignal.timeout(12000), redirect: 'error', headers: {Accept: 'application/json'}});
  if (!response.ok) throw Object.assign(new Error(response.status === 429 ? 'Hugging Face is rate limiting requests. Try again shortly.' : `Hugging Face returned HTTP ${response.status}. Try again shortly.`), {status: 503});
  return {data: await response.json(), link: response.headers.get('link')};
}

export function createHuggingFaceSearch({read = readHuggingFace, now = Date.now} = {}) {
  const cache = new Map();
  const pending = new Map();
  return async function search({kind = 'models', q = '', cursor = ''} = {}) {
    if (!HF_KINDS.includes(kind) || typeof q !== 'string' || q.length > 160 || typeof cursor !== 'string' || cursor.length > 4096) throw badRequest('Invalid Hugging Face search parameters');
    const url = new URL(`${HF_ORIGIN}/api/${kind}`);
    url.search = new URLSearchParams({search: q.trim(), limit: '24', sort: kind === 'spaces' ? 'likes' : 'downloads', direction: '-1', full: 'true'}).toString();
    if (cursor) url.searchParams.set('cursor', cursor);
    const key = url.href;
    const cached = cache.get(key);
    if (cached && now() - cached.time < 300000) return {...cached.result, cached: true};
    if (pending.has(key)) return pending.get(key);
    const request = (async () => {
      try {
        const {data, link} = await read(key);
        if (!Array.isArray(data)) throw Error('Invalid Hugging Face search response');
        let nextCursor = null;
        const next = link?.match(/<([^>]+)>;\s*rel="next"/);
        if (next) {
          const nextUrl = new URL(next[1]);
          if (nextUrl.origin === HF_ORIGIN && nextUrl.pathname === `/api/${kind}`) nextCursor = nextUrl.searchParams.get('cursor');
        }
        const result = {items: data.filter(item => item.private !== true).map(item => normalizeHuggingFace(item, kind)), nextCursor, fetchedAt: new Date(now()).toISOString(), stale: false};
        if (cache.size >= 100) cache.delete(cache.keys().next().value);
        cache.set(key, {time: now(), result});
        return result;
      } catch (error) {
        if (cached) return {...cached.result, stale: true, warning: 'Hugging Face is unavailable. Showing the last successful result for this search.'};
        throw Object.assign(error, {status: 503});
      } finally { pending.delete(key); }
    })();
    pending.set(key, request);
    return request;
  };
}
