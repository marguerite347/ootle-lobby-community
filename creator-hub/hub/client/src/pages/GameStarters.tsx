import BuildToolkit from '../components/BuildToolkit';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type GameLibrary } from '../api';
import { MediaThumb } from '../media';

export default function GameStarters() {
 const [data, setData] = useState<GameLibrary | null>(null);
 const [error, setError] = useState('');
 const [retry, setRetry] = useState(0);
 const [params, setParams] = useSearchParams();
 const [limit, setLimit] = useState(6);
 const genre = params.get('genre') || '';
 const q = params.get('q') || '';
 const engine = params.get('engine') || '';
 const kind = params.get('kind') || '';
 useEffect(() => { let active = true; setError(''); api.gameStarters().then(d => { if(active) setData(d); }).catch(() => { if(active) setError('Could not load game starting points.'); }); return () => { active = false; }; }, [retry]);
 function filter(key: string, value: string) { const next = new URLSearchParams(params); if(value) next.set(key,value); else next.delete(key); setParams(next,{replace:true}); setLimit(6); }
 const items = (data?.items || []).filter(r => (!genre || r.genres.includes(genre)) && (!engine || r.engine === engine) && (!kind || r.kind === kind) && q.toLowerCase().split(/\s+/).every(t => [r.title,r.summary,...r.tags].join(' ').toLowerCase().includes(t)));
 return <section className="section game-library" aria-labelledby="game-library-title">
  <div className="section-head"><div><p className="faint">START WITH SOMETHING YOU CAN MAKE YOUR OWN</p><h2 id="game-library-title">What are we building?</h2></div></div>
  <p className="muted">Find a foundation you can riff on. Narrow it down by game type or engine, explore the source, then bring Tari building blocks into your project.</p>
  <div className="genre-options mt16" aria-label="Game types">
   <button className={`btn ${!genre?'primary':''}`} aria-pressed={!genre} onClick={()=>filter('genre','')}>All types {data?.items.length ?? ''}</button>
   {data?.genres.map(g=><button key={g.id} className={`btn ${genre===g.id?'primary':''}`} aria-pressed={genre===g.id} onClick={()=>filter('genre',g.id)}>{g.label} <span className="faint">{g.count}</span></button>)}
  </div>
  <div className="starter-filters mt16">
   <label>Find a starting point<input className="field" type="search" value={q} onChange={e=>filter('q',e.target.value)} placeholder="Balatro, idle, racing, inventory…" /></label>
   <label>Engine / ecosystem<select className="field" value={engine} onChange={e=>filter('engine',e.target.value)}><option value="">All ecosystems</option>{Array.from(new Set(data?.items.map(r=>r.engine))).sort().map(e=><option key={e} value={e}>{e}</option>)}</select></label>
   <label>Starting point<select className="field" value={kind} onChange={e=>filter('kind',e.target.value)}><option value="">All kinds</option>{['starter','framework','mod','component','reference'].map(k=><option key={k} value={k}>{k}</option>)}</select></label>
  </div>
  {(genre || engine || kind || q) && <div className="pill-row mt16" aria-label="Active starter filters">{[['genre',genre],['engine',engine],['kind',kind],['q',q]].filter(([,v])=>v).map(([key,value])=><button className="btn small" key={key} onClick={()=>filter(key,'')} aria-label={`Remove ${key} filter`}>{key === 'genre' ? data?.genres.find(g=>g.id===value)?.label || value : value} ×</button>)}</div>}
  {error && <div className="panel" role="alert"><p>{error}</p><button className="btn mt16" onClick={()=>setRetry(n=>n+1)}>Try again</button></div>}
  {!data && !error && <p role="status">Loading game foundations…</p>}
  {data && <p className="faint mt16" role="status">{items.length} starting points</p>}
  {data && !items.length && <div className="panel mt16">No matching starters yet. <button className="btn" onClick={()=>{setParams({view:'frameworks'});setLimit(6);}}>Clear filters</button></div>}
  <div className="starter-grid mt16">{items.slice(0,limit).map(r=><article className="starter-card" key={r.id}>
   <MediaThumb r={r}/>
   <div className="starter-card-body">
    <div className="pill-row"><span className="badge">{r.kind}</span><span className="badge">{r.native?'Native Tari resource':'Tari integration unverified'}</span></div>
    <h3 className="mt8">{r.title}</h3><p className="faint">{r.engine}</p><p className="summary mt8">{r.summary}</p>
    <p className="faint mt8">{r.license || 'Reuse terms: check upstream'}</p>
    <details className="mt8"><summary>Setup &amp; what to customize</summary><p className="muted mt8">{r.setupHint || 'Open the upstream guide for setup and supported engine versions.'}</p>{r.prerequisites.map(p=><p key={p} className="faint mt8">{p}</p>)}<p className="muted mt8">Make the mechanics, content and presentation your own. Suggested Tari additions need a separate adapter and tests.</p><Link to="/skills/templates-composability">Learn Tari composability →</Link></details>
    <BuildToolkit initialIdea={`${r.title} ${r.engine} ${r.genres.join(" ")}`} resourceId={r.id}/>
    <div className="starter-actions">
     <Link className="btn small" to={`/resource/${encodeURIComponent(r.id)}`}>Details</Link>
     {r.demoUrl && <a className="btn small" href={r.demoUrl} target="_blank" rel="noreferrer">Open demo / examples ↗</a>}
     {r.repoUrl && <a className="btn small" href={r.repoUrl} target="_blank" rel="noreferrer">Source / fork ↗</a>}
     {r.type==='starter' && <Link className="btn primary small" to={`/create/project?template=${encodeURIComponent(r.id)}`}>Use as starting point →</Link>}
    </div>
   </div>
  </article>)}</div>
  {items.length>limit && <button className="btn mt16" onClick={()=>setLimit(n=>n+12)}>Show more ({items.length-limit} remaining)</button>}
  <div className="panel mt24"><h3>Compose your game with Tari</h3><p className="muted mt8">Keep your game engine. Explore native templates for state, tokens and collectibles, add resource references to your saved project, and validate the connection before using it.</p><div className="row mt16"><Link className="btn" to="/explore?ecosystem=tari-ootle&type=starter">Tari building blocks</Link><Link className="btn" to="/create/recipe/token-rewarded-counter">Explore a composition</Link><a className="btn" href="https://github.com/topics/incremental-game" target="_blank" rel="noreferrer">More incremental sources ↗</a></div></div>
 </section>;
}
