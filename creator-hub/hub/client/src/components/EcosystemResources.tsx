import {recordingLabel} from './ProjectCard';
import {useState} from 'react';
import {ResourceCardMedia} from '../ui';
import {Link} from 'react-router-dom';
import resources from '../../../shared/ecosystemResources.json';
import {homepageResources} from './homepageEcosystem';
import './EcosystemResources.css';

export default function EcosystemResources() {
  const [query, setQuery] = useState('');
  const records = homepageResources.filter(record => `${record.title} ${record.group} ${record.summary}`.toLowerCase().includes(query.toLowerCase()));
  const opportunities = resources.opportunities.filter(item => Date.now() < Date.parse(item.expiresAt));
  return <section className="section ecosystem-resources" id="ecosystem-resources" aria-labelledby="ecosystem-title">
    <div className="section-head"><div><h2 id="ecosystem-title">Build with the <em>ecosystem.</em></h2><p>Official guides, language SDKs and reusable community sources.</p></div></div>
    <p>Start with the docs, choose an SDK, then explore testnet tools and templates.</p>
    <label className="ecosystem-search">Find a builder resource<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Python, faucet, templates…" /></label>
    <div className="ecosystem-grid">{records.map(record => <article key={record.id} id={`resource-${record.key}`} className="ecosystem-card">
      <ResourceCardMedia r={{...record,native:true}}/>
      <h3><Link to={`/resource/${encodeURIComponent(record.id)}`}>{record.title}</Link></h3>
      <p className="card-front-summary">{record.cardSummary}</p>
      <div className="card-front-status"><strong>{record.cardStatus}</strong>{record.preview && <span>{recordingLabel(record.preview.source)}</span>}</div>
      <p className="card-byline">{record.creator.name} · {record.group}</p>
      <div className="card-front-links">{record.demoUrl && <a href={record.demoUrl} target="_blank" rel="noreferrer">Open app ↗</a>}<a href={record.repoUrl || record.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>{record.discussionLinks?.map(post=><a key={post.url} href={post.url} target="_blank" rel="noreferrer">Discussion · {post.platform} ↗</a>)}</div>
      <details className="card-details"><summary aria-label={`Details about ${record.title}`}>Details</summary>
       <p>{record.summary}</p><p>{record.status} · {record.network}</p>
       <p>{record.license || 'License not established'} · Checked {record.lastCheckedAt.slice(0,10)}</p>
       <p>{record.preview?.source}</p>
       <Link to={`/resource/${encodeURIComponent(record.id)}`}>Full resource &amp; provenance →</Link>
      </details>
    </article>)}</div>
    {!records.length && <p role="status">No matching resources.</p>}
    {opportunities.map(item => <aside key={item.id} id={`resource-${item.id}`} className="ecosystem-opportunity">{item.preview && <figure><video controls muted playsInline preload="none" src={item.preview.video} poster={item.preview.image} aria-label={`${item.title} recording`}/></figure>}<h3>{item.title}</h3><p className="card-front-summary">{item.cardSummary}</p><div className="card-front-status"><strong>{item.cardStatus}</strong><span>Announcement</span></div><a href={item.sourceUrl} target="_blank" rel="noreferrer">Original post ↗</a><details className="card-details"><summary>Details</summary><p>{item.summary}</p><p>{item.preview?.source}</p></details></aside>)}
  </section>;
}
