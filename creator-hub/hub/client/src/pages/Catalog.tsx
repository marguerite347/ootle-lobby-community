import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { api, type Facets, type Resource } from '../api';
import { ResourceCardMedia, ReadinessBadge, StarButton, Spinner, ecoLabel } from '../ui';
import {discoveryLibrary, destinationLink} from './destinationLibrary';
import {discoveryResults} from './discovery';
import './Discover.css';
import LobbyTrail from '../components/LobbyTrail';
import '../components/GameKit.css';
const types=[['','Everything'],['app','Apps'],['starter','Game & app starters'],['component','Components'],['asset','Assets'],['tool','Tools & references']];
const keys=['q','type','ecosystem','readiness','native','tag'];
const pretty=(v:string)=>v.replace(/-/g,' ').replace(/^./,c=>c.toUpperCase());
export default function Catalog({mode}:{mode:'explore'|'build'}){
 const [params,setParams]=useSearchParams();
 const [data,setData]=useState<{count:number;facets:Facets;items:Resource[]}|null>(null);
 const [error,setError]=useState(false);
 const [retry,setRetry]=useState(0);
 const [q,setQ]=useState(params.get('q')||'');
 const [limit,setLimit]=useState(24);
 useEffect(()=>{setQ(params.get('q')||'');setLimit(24);},[params]);
 useEffect(()=>{let active=true;setError(false);api.resources().then(d=>{if(active)setData(discoveryLibrary(d.items));}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[retry]);
 function change(key:string,value:string){const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);setParams(next);}
 const rows=data?discoveryResults(data.items,params):[];
 const active=keys.filter(k=>params.get(k));
 const clear=()=>setParams(new URLSearchParams());
 const selected=types.find(([id])=>id===(params.get('type')||''))?.[1]||'Resources';
 if(params.get('type')==='learn') return <Navigate replace to={destinationLink('/learn', params, ['q','ecosystem'])}/>;
 return <div className="discover-page">
  <LobbyTrail section="Discover" />
  <header className="discover-hero">
   <div><p className="discover-eyebrow">DISCOVER / THE RESOURCE LIBRARY</p><h1>{mode==='build'?'Pick your build’s next upgrade.':'Your next build starts with a find.'}</h1><p>Search games, starter templates, components and assets. Compare ecosystems, check readiness and choose what fits your project.</p></div>
  </header>
  <section className="discover-browser" aria-label="Discover resources">
   <form className="discover-search" onSubmit={e=>{e.preventDefault();change('q',q.trim());}}><label htmlFor="discover-search">What are you looking for?</label><div><input id="discover-search" type="search" placeholder="Try a game mechanic, app, template or creator…" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn primary" type="submit">Search</button></div></form>
   <nav className="discover-types" aria-label="Resource categories">{types.map(([id,label])=><button key={id} aria-pressed={(params.get('type')||'')===id} onClick={()=>change('type',id)}>{label}<span>{data?(id?data.facets.type?.[id]||0:data.count):'·'}</span></button>)}</nav>
   <div className="discover-toolbar"><div className="discover-filter-fields">{(['ecosystem','readiness'] as const).map(key=><label key={key}>{key==='ecosystem'?'Ecosystem':'Readiness'}<select value={params.get(key)||''} onChange={e=>change(key,e.target.value)}><option value="">{key==='ecosystem'?'All ecosystems':'Any readiness'}</option>{params.get(key)&&!data?.facets[key]?.[params.get(key)!]&&<option value={params.get(key)!}>{pretty(params.get(key)!)}</option>}{Object.keys(data?.facets[key]||{}).sort().map(v=><option value={v} key={v}>{key==='ecosystem'?ecoLabel(v):pretty(v)}</option>)}</select></label>)}</div><label>Order by<select value={params.get('sort')||'default'} onChange={e=>change('sort',e.target.value==='default'?'':e.target.value)}><option value="default">Tari first</option><option value="popular">Discovery score</option></select></label></div>
   {!!active.length&&<div className="discover-active">{active.map(k=><button key={k} onClick={()=>change(k,'')} aria-label={`Remove ${k} filter`}>{k==='type'?selected:k==='native'?`Native: ${params.get(k)}`:params.get(k)} <span aria-hidden="true">×</span></button>)}<button onClick={clear}>Clear all</button></div>}
   <div className="discover-result-head"><h2>{selected==='Everything'?'Explore the collection':selected}</h2><span role="status">{data?`${rows.length} ${rows.length===1?'resource':'resources'}`:'Loading resources'}</span></div>
   {error?<div className="discover-empty" role="alert"><h3>The collection couldn’t load.</h3><p>Your filters are saved. Try again in a moment.</p><button className="btn" onClick={()=>setRetry(n=>n+1)}>Retry</button></div>:!data?<Spinner/>:!rows.length?<div className="discover-empty"><h3>Nothing here matches yet.</h3><p>Try another category, remove a filter, or explore the whole collection.</p><button className="btn" onClick={clear}>Explore everything</button><p>Looking for an explanation? <Link to={destinationLink('/learn', params, ['q','ecosystem'])}>Search guides →</Link></p></div>:<>
    <div className="discover-grid">{rows.slice(0,limit).map(r=><article key={r.id} className="discover-card"><ResourceCardMedia r={r}/><div className="discover-card-body"><div className="discover-card-meta"><span>{types.find(([id])=>id===r.type)?.[1]||pretty(r.type)}</span>{r.cardSummary ? (r.cardStatus && <span className="badge">{r.cardStatus}</span>) : <ReadinessBadge r={r}/>}</div><Link className="discover-title" to={`/resource/${encodeURIComponent(r.id)}`}><h3>{r.title}</h3></Link><p>{r.cardSummary||r.summary||r.category||'Open this resource to explore its source and setup.'}</p><div className="discover-card-footer"><span>{r.creator?.name?`by ${r.creator.name}`:ecoLabel(r.ecosystem)}</span><StarButton kind="resource" id={r.id} initialStars={r.engagement?.stars??0}/><Link to={`/resource/${encodeURIComponent(r.id)}`} aria-label={`Explore ${r.title}`}>Explore ↗</Link></div></div></article>)}</div>
    <div className="discover-more"><p>Showing {Math.min(limit,rows.length)} of {rows.length}</p>{limit<rows.length&&<button className="btn" onClick={()=>setLimit(n=>n+24)}>Show more resources</button>}</div>
   </>}
  </section>
  <nav className="discover-library-links" aria-label="Related libraries">
   <Link to={destinationLink('/learn', params, ['q','ecosystem'])}>Need an explanation? Read a guide →</Link>
   <Link to="/huggingface">AI models & datasets ↗</Link>
   <Link to="/skills">Agent skills & workflows →</Link>
   <Link to="/sources">Sources & freshness →</Link>
  </nav>
  <footer className="discover-note"><p>Someone cooked. You get a head start.</p><span>Previews must reflect the specific resource. Recorded webpages and generated previews are labeled separately. Check setup and compatibility before building.</span><Link to="/">Community releases & weekly challenges →</Link></footer>
 </div>;
}
