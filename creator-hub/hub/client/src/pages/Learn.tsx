import ShareLearning from './ShareLearning';
import { useEffect, useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { api, type LearnView } from '../api';
import { Spinner, ecoLabel } from '../ui';
import {guideLibrary, destinationLink} from './destinationLibrary';
import { learningResults } from './learnLibrary';
import './Learn.css';
import LobbyTrail from '../components/LobbyTrail';

const labels: Record<string, string> = { q: 'Search', topic: 'Tari goal', category: 'Category', level: 'Level', format: 'Format', ecosystem: 'Ecosystem' };
const pretty = (s: string) => s === 'guide' ? 'Guides & references' : s === 'playcanvas' ? 'PlayCanvas' : s.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<LearnView | null>(null);
  const [err, setErr] = useState(false);
  const [retry, setRetry] = useState(0);
  const [limit, setLimit] = useState(24);
  useEffect(() => { setLimit(24); }, [params]);
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);
  useEffect(() => {
    let active = true;
    setErr(false);
    api.learn().then(result => { if (active) setData(guideLibrary(result)); }).catch(() => { if (active) setErr(true); });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    if (!err) return;
    const recover = () => setRetry(n => n + 1);
    window.addEventListener('online', recover);
    window.addEventListener('focus', recover);
    return () => {
      window.removeEventListener('online', recover);
      window.removeEventListener('focus', recover);
    };
  }, [err]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (key === 'category') next.delete('topic');
    if (key === 'topic') next.delete('category');
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  const selected = Object.keys(labels).filter(k => params.get(k));
  const rows = data ? learningResults(data, params) : [];
  const topic = data?.topics.find(t => t.id === params.get('topic'));
  const category = data?.categories?.find(t => t.id === params.get('category'));
  const reset = () => setParams(new URLSearchParams());
  if (params.get('learningKind') === 'skill') return <Navigate replace to={destinationLink('/skills', params, ['q', 'category'])} />;
  return <div className="learn-library">
    <LobbyTrail section="Learn" />
    <header className="learn-intro">
      <div><p className="learn-eyebrow">LEARN / GUIDES & EXPLANATIONS</p><h1>Figure it out. Then go off.</h1><p className="learn-lede">Read tutorials, study examples and solve a specific problem. Choose a topic, then narrow by experience level or format.</p></div>
      <Link to={destinationLink('/skills', params, ['q','category'])} className="learn-skills"><span>Want your agent to do the work?</span><strong>Get reusable instructions<br />in Skills →</strong><small>Download bundles and setup prompts</small></Link>
    </header>
    {!selected.length && data && <section className="learn-paths" aria-label="Creator categories">
      {data.categories?.filter(t => t.id !== 'references').map((t,i) => <button key={t.id} onClick={() => change('category',t.id)}><span className="learn-step">{String(i+1).padStart(2,'0')} / {t.items.length} resources</span><strong>{t.label} <span aria-hidden="true">↗</span></strong><span>{t.description}</span></button>)}
    </section>}
    <section className="learn-browser" aria-label="Browse learning resources">
      <form className="learn-search" onSubmit={e => {e.preventDefault(); change('q',q.trim());}}>
        <label htmlFor="learn-search">What do you want to understand?</label><div><input id="learn-search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Try game feel, Blueprints, voice, Tari…" /><button type="submit" className="btn primary">Search</button></div>
      </form>
      <div className="learn-layout">
        <aside className="learn-goals" aria-label="Learning categories"><h2>Browse categories</h2><button aria-pressed={!params.get('topic') && !params.get('category')} onClick={() => {const next = new URLSearchParams(params); next.delete('topic'); next.delete('category'); setParams(next);}}>All guides <span>{data?.count.toLocaleString()}</span></button>{data?.categories?.map(t => <button key={t.id} aria-pressed={params.get('category') === t.id} onClick={() => change('category',t.id)}>{t.label}<span>{t.items.length.toLocaleString()}</span></button>)}<details className="learn-tari-goals" open={!!params.get('topic')}><summary>Tari learning goals</summary>{data?.topics.map(t => <button key={t.id} aria-pressed={params.get('topic') === t.id} onClick={() => change('topic',t.id)}>{t.label}<span>{t.items.length}</span></button>)}</details><Link className="learn-build" to="/create">Ready to try it?<strong>Open Create</strong></Link></aside>
        <div className="learn-results">
          <div className="learn-selects">{(['ecosystem','level','format'] as const).map(key => <label key={key}>{labels[key]}<select value={params.get(key) || ''} onChange={e => change(key,e.target.value)}><option value="">All {key === 'ecosystem' ? 'ecosystems' : key + 's'}</option>{params.get(key) && !data?.facets[key]?.[params.get(key)!] && <option value={params.get(key)!}>{pretty(params.get(key)!)}</option>}{Object.keys(data?.facets[key] || {}).sort().map(v => <option key={v} value={v}>{key === 'ecosystem' ? pretty(ecoLabel(v)) : pretty(v)}</option>)}</select></label>)}</div>
          {!!selected.length && <div className="learn-active" aria-label="Active filters">{selected.map(key => <button key={key} onClick={() => change(key,'')} aria-label={`Remove ${labels[key]} filter`}>{labels[key]}: {key === 'category' ? category?.label || params.get(key) : key === 'topic' ? topic?.label || params.get(key) : pretty(params.get(key)!)} <span aria-hidden="true">×</span></button>)}<button className="learn-clear" onClick={reset}>Clear all</button></div>}
          <div className="learn-result-heading"><h2>{category?.label || topic?.label || 'Guides & references'}</h2><span role="status">{err ? 'Library unavailable' : data ? `${rows.length} resource${rows.length === 1 ? '' : 's'}` : 'Loading resources'}</span></div>
          {err ? <div className="learn-empty"><h3>We couldn’t load the library.</h3><p>Your filters are saved. Try loading it again.</p><button className="btn" onClick={() => setRetry(n => n+1)}>Retry</button></div> : !data ? <Spinner /> : rows.length === 0 ? <div className="learn-empty"><h3>No matches for this combination.</h3><p>Remove a filter above, or browse the full library to find another starting point.</p><button className="btn" onClick={reset}>Browse all guides</button><p>Looking for a tool? <Link to={destinationLink('/explore', params, ['q','ecosystem'])}>Search Discover →</Link></p></div> : <div className="learn-rows">{rows.slice(0,limit).map(r => <Link className="learn-row" key={r.id} to={r.learningHref || `/resource/${encodeURIComponent(r.id)}`}><div className={`learn-resource-icon ${r.native ? 'native' : ''}`} aria-hidden="true">{r.learningKind === 'skill' ? '≡' : r.native ? '✳' : '↗'}</div><div className="learn-row-body"><div className="learn-meta"><span>{pretty(ecoLabel(r.ecosystem))}</span><span>{pretty(r.format || 'resource')}</span>{r.level && <span>{pretty(r.level)}</span>}{r.lifecycle && <span>{r.lifecycle}</span>}</div><h3>{r.title}</h3><p>{r.summary}</p><small>{r.provenance.sourceName}{r.sharedBy ? ` · Shared by ${r.sharedBy.name}` : ''}{r.provenance.freshness === 'stale' ? ' · Last saved version, refresh pending' : ''}{r.learningKind === 'skill' ? ' · Read validation scope before use' : !r.native ? ' · External resource' : ''}</small></div><span className="learn-open">Read →</span></Link>)}</div>}
          {data && !err && rows.length > limit && <div className="learn-more"><p>Showing {Math.min(limit,rows.length)} of {rows.length.toLocaleString()}</p><button className="btn" onClick={()=>setLimit(n=>n+24)}>Show 24 more</button></div>}
        </div>
      </div>
    </section>
    <ShareLearning onShared={()=>setRetry(n=>n+1)}/>
    <p className="learn-source-note">Guides explain concepts and techniques; reference collections point to further reading. For downloadable agent instructions, visit Skills. External guidance does not verify a Tari integration. <Link to="/sources">View sources and freshness →</Link></p>
  </div>;
}
