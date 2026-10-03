import type { LearnView } from '../api';

const SEARCH_TOKEN_GAP = /[^\p{L}\p{N}_]+/u;

/** Match each query word as its own token. "360" hits "360° Platformer" and misses "3600". */
function matchesSearchWords(haystack: string, words: string[]) {
  const tokens = new Set(haystack.toLowerCase().split(SEARCH_TOKEN_GAP).filter(Boolean));
  return words.every(word => {
    const parts = word.toLowerCase().split(SEARCH_TOKEN_GAP).filter(Boolean);
    return parts.length > 0 && parts.every(part => tokens.has(part));
  });
}

// Keep category navigation available while filtering the shared learning index.
export function learningResults(data: LearnView, params: URLSearchParams) {
  const topic = params.get('topic');
  const category = params.get('category');
  const groups = category ? (data.categories || []).filter(t => t.id === category) : topic ? data.topics.filter(t => t.id === topic) : data.topics;
  const rows = [...groups.flatMap(t => t.items), ...(topic || category ? [] : data.other)];
  const words = (params.get('q') || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  return [...new Map(rows.map(r => [r.id, r])).values()].filter(r => {
    if (['level', 'format', 'ecosystem', 'learningKind'].some(k => params.get(k) && r[k as 'level' | 'format' | 'ecosystem' | 'learningKind'] !== params.get(k))) return false;
    const text = [r.title, r.summary, r.category, r.creator?.name, r.ecosystem, ...(r.tags || [])].join(' ').toLowerCase();
    return matchesSearchWords(text, words);
  }).sort((a,b) => Number(b.native) - Number(a.native) || a.title.localeCompare(b.title));
}
