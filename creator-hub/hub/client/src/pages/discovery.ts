import type {Resource} from '../api';

const SEARCH_TOKEN_GAP = /[^\p{L}\p{N}_]+/u;

/** Match each query word as its own token. "360" hits "360° Platformer" and misses "3600". */
function matchesSearchWords(haystack: string, words: string[]) {
  const tokens = new Set(haystack.toLowerCase().split(SEARCH_TOKEN_GAP).filter(Boolean));
  return words.every(word => {
    const parts = word.toLowerCase().split(SEARCH_TOKEN_GAP).filter(Boolean);
    return parts.length > 0 && parts.every(part => tokens.has(part));
  });
}

export function discoveryResults(items:Resource[],params:URLSearchParams){
 const words=(params.get('q')||'').toLowerCase().trim().split(/\s+/).filter(Boolean);
 return items.filter(r=>{
  if(['type','ecosystem','readiness'].some(k=>params.get(k)&&r[k as 'type'|'ecosystem'|'readiness']!==params.get(k)))return false;
  if(params.get('tag')&&!(r.tags||[]).includes(params.get('tag')!))return false;
  if(params.get('native')==='true'&&!r.native)return false;
  if(params.get('native')==='false'&&r.native)return false;
  const hay=[r.title,r.summary,r.category,r.creator?.name,r.ecosystem,...(r.tags||[])].join(' ').toLowerCase();
  return matchesSearchWords(hay, words);
 }).sort((a,b)=>params.get('sort')==='popular'?(b.popularity?.score??-1)-(a.popularity?.score??-1)||a.title.localeCompare(b.title):Number(b.native)-Number(a.native)||a.title.localeCompare(b.title));
}
