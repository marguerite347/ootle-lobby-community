import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import type {Resource} from '../api';
import './HuggingFace.css';

type SearchResult = {items: Resource[]; nextCursor: string | null; fetchedAt: string; stale: boolean; warning?: string};
const KINDS = ['models', 'datasets', 'spaces'];
export default function HuggingFace() {
  const [params, setParams] = useSearchParams();
  const kind = KINDS.includes(params.get('kind') || '') ? params.get('kind')! : 'models';
  const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [cursor, setCursor] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {setInput(query); setCursor(''); setResult(null);}, [query, kind]);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true); setError('');
    const search = new URLSearchParams({kind, q: query, cursor});
    fetch(`/api/huggingface/search?${search}`, {signal: controller.signal}).then(async response => {
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Search could not load.');
      if (controller.signal.aborted) return;
      setResult(previous => ({...data, items: cursor && previous ? Array.from(new Map([...previous.items, ...data.items].map(item => [item.id, item])).values()) : data.items}));
    }).catch(reason => {if (!controller.signal.aborted) setError(reason.message);}).finally(() => {if (!controller.signal.aborted) setBusy(false);});
    return () => controller.abort();
  }, [query, kind, cursor, retry]);
  function changeSearch(nextKind: string, nextQuery: string) {setCursor(''); setResult(null); setParams({kind: nextKind, q: nextQuery}); setRetry(value => value + 1);}
  return <div className="hf-page">
    <header className="hf-hero"><span className="release-label">HUGGING FACE × YOUR NEXT IDEA</span><h1>Find the intelligence.<br/><span className="grad">Make it creative.</span></h1><p>Explore public AI models, datasets and interactive Spaces. Find a voice, generate visuals, build an agent, or discover the data behind your next project.</p><div className="hf-links"><Link to="/explore?ecosystem=huggingface">Creator picks ↗</Link><Link to="/skills?q=Hugging%20Face">Hugging Face agent skills ↗</Link></div></header>
    <section className="hf-search" aria-label="Search Hugging Face">
      <nav aria-label="Hugging Face resource type">{KINDS.map(value => <button key={value} aria-pressed={kind === value} onClick={() => changeSearch(value, query)}>{value === 'spaces' ? 'Spaces / demos' : value[0].toUpperCase() + value.slice(1)}</button>)}</nav>
      <form onSubmit={event => {event.preventDefault(); changeSearch(kind, input.trim());}}><label htmlFor="hf-query">Search the public Hugging Face Hub</label><div><input id="hf-query" type="search" maxLength={160} value={input} onChange={event => setInput(event.target.value)} placeholder="Try text-to-speech, image generation, Qwen…"/><button className="btn primary">Search</button></div></form>
      <div className="hf-suggestions">Try {['text-to-speech', 'FLUX', 'music', '3D', 'Whisper'].map(value => <button key={value} onClick={() => changeSearch(kind, value)}>{value}</button>)}</div>
      <p className="hf-status" role="status">{busy ? 'Searching Hugging Face…' : result ? `${result.items.length} results loaded · ${kind === 'spaces' ? 'Most liked first' : 'Most downloaded first'}` : ''}</p>
      {result?.stale && <p role="status">{result.warning}</p>}
      {error && <div role="alert"><p>{error}</p><button className="btn" onClick={() => setRetry(value => value + 1)}>Retry search</button></div>}
      {!busy && !error && result?.items.length === 0 && <p>No matches. Try a model name, creator, or shorter search.</p>}
      <div className="hf-results">{result?.items.map(item => <article key={item.id}><div><span className="hf-kind">{item.category} · {item.creator?.name}</span><h2><a href={safeHref(item.sourceUrl || '#')} target="_blank" rel="noreferrer">{item.title} ↗</a></h2><p>{item.summary}</p><div className="hf-tags">{item.tags.filter(tag => !tag.includes(':')).slice(0,4).map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="hf-license"><span>License</span><strong>{item.license || 'Check source card'}</strong><a href={safeHref(item.sourceUrl || '#')} target="_blank" rel="noreferrer">{kind === 'spaces' ? 'Open Space ↗' : 'View source card ↗'}</a></div></article>)}</div>
      {result?.nextCursor && <button className="btn" disabled={busy} onClick={() => setCursor(result.nextCursor!)}>{busy ? 'Loading…' : 'Load more results'}</button>}
    </section>
    <footer className="hf-footer">Live public metadata from Hugging Face. Creator picks are also imported into Discover. Models and datasets are not downloaded by browsing; usage terms, hardware needs and access conditions vary by resource. <Link to="/sources">View source freshness →</Link></footer>
  </div>;
}
