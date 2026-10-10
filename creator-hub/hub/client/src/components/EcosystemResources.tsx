import {useState} from 'react';
import {Link} from 'react-router-dom';
import resources from '../../../shared/ecosystemResources.json';
import './EcosystemResources.css';

export default function EcosystemResources() {
  const [query, setQuery] = useState('');
  const records = resources.records.filter(record => `${record.title} ${record.group} ${record.summary}`.toLowerCase().includes(query.toLowerCase()));
  const opportunities = resources.opportunities.filter(item => Date.now() < Date.parse(item.expiresAt));
  return <section className="section ecosystem-resources" id="ecosystem-resources" aria-labelledby="ecosystem-title">
    <div className="section-head"><div><h2 id="ecosystem-title">Build with the <em>ecosystem.</em></h2><p>Official guides, language SDKs and reusable community sources.</p></div></div>
    <p>Start with the docs, choose an SDK, then explore testnet tools and templates. Source checked October 10, 2026; runtime limits are listed with each resource.</p>
    <label className="ecosystem-search">Find a builder resource<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Python, faucet, templates…" /></label>
    <div className="ecosystem-grid">{records.map(record => <article key={record.id} className="ecosystem-card">
      <span className="faint">{record.group} · {record.network}</span>
      <h3><Link to={`/resource/${encodeURIComponent(record.id)}`}>{record.title}</Link></h3>
      <p>{record.summary}</p><p className="ecosystem-status">{record.status}</p>
      <Link to={`/resource/${encodeURIComponent(record.id)}`}>Source & details →</Link>
    </article>)}</div>
    {!records.length && <p role="status">No matching resources.</p>}
    {opportunities.map(item => <aside key={item.id} className="ecosystem-opportunity"><strong>{item.title}</strong><p>{item.summary}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">Read the organizer’s announcement ↗</a></aside>)}
  </section>;
}
