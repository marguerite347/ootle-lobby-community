import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {api, type Resource} from '../api';
import {ReadinessBadge} from '../ui';
import LobbyTrail from '../components/LobbyTrail';
import './OotleTemplates.css';

type Skill = {id:string; title:string; description:string; lifecycle:string};
export default function OotleTemplates() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setErrors([]);
    Promise.allSettled([
      api.resources({ecosystem:'tari-ootle'}),
      fetch('/api/skills').then(response => {if(!response.ok) throw Error('Skills unavailable'); return response.json();}),
    ]).then(([catalog, native]) => {
      if (!active) return;
      setResources(catalog.status === 'fulfilled' ? catalog.value.items.filter((item: Resource) => item.ecosystem === 'tari-ootle') : []);
      setSkills(native.status === 'fulfilled' ? native.value.skills : []);
      setErrors([...(catalog.status === 'rejected' ? ['Template catalog could not load.'] : []), ...(native.status === 'rejected' ? ['Agent skills could not load.'] : [])]);
      setLoading(false);
    });
    return () => {active = false;};
  }, [retry]);
  const matches = (title:string, description:string) => query.toLowerCase().trim().split(/\s+/).every(word => `${title} ${description}`.toLowerCase().includes(word));
  const templates = resources.filter(item => ['starter','component'].includes(item.type) && matches(item.title, item.summary || ''));
  const guides = resources.filter(item => item.type === 'learn' && matches(item.title, item.summary || ''));
  const shownSkills = skills.filter(item => matches(item.title, item.description));
  function resourceGroup(title:string, id:string, items:Resource[]) {
    return <section id={id} className="ootle-library-section"><div className="ootle-library-heading"><h2>{title}</h2><span>{items.length}</span></div>
      <div className="ootle-library-grid">{items.map(item => <Link className="ootle-library-card" key={item.id} to={`/resource/${encodeURIComponent(item.id)}`}>
        {item.cardSummary ? (item.cardStatus && <span className="badge">{item.cardStatus}</span>) : <ReadinessBadge r={item}/>}<h3>{item.title}</h3><p>{item.cardSummary || item.summary}</p><strong>Explore {id === 'templates' ? 'template' : 'guide'} ↗</strong>
      </Link>)}</div>{!items.length && <p>No matching {title.toLowerCase()}.</p>}</section>;
  }
  return <div className="ootle-library">
    <LobbyTrail section="Ootle Templates"/>
    <header><span className="ootle-library-kicker">NATIVE BUILDING BLOCKS</span><h1>Ootle Templates</h1><p>The code, guides and agent skills for your next Ootle creation. Find a foundation. Learn how it works. Make it yours.</p>
      <div className="ootle-library-actions"><Link className="btn primary" to="/skills/templates-composability">Start with templates ↗</Link><Link className="btn" to="/skills/developer-setup">Set up your tools ↗</Link></div>
    </header>
    <nav className="ootle-library-tabs" aria-label="Ootle collection sections"><a href="#templates">Templates</a><a href="#guides">Guides</a><a href="#agent-skills">Agent Skills</a></nav>
    <label className="ootle-library-search">Find a template, concept or task<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try tokens, testing, privacy or a guessing game…"/></label>
    {errors.length > 0 && <div role="alert">{errors.map(error => <p key={error}>{error}</p>)}<button className="btn" onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
    {loading ? <p role="status">Loading Ootle resources…</p> : <>
      <p className="ootle-library-note">Choose a template or guide, then check its setup and compatibility requirements.</p>
      {resourceGroup('Templates', 'templates', templates)}
      {resourceGroup('Guides', 'guides', guides)}
      <section id="agent-skills" className="ootle-library-section"><div className="ootle-library-heading"><h2>Agent Skills</h2><span>{shownSkills.length}</span></div>
        <div className="ootle-library-grid">{shownSkills.map(skill => <Link className="ootle-library-card" key={skill.id} to={`/skills/${encodeURIComponent(skill.id)}`}><span className="badge">{skill.lifecycle}</span><h3>{skill.title}</h3><p>{skill.description}</p><strong>Read skill ↗</strong></Link>)}</div>
        {!shownSkills.length && <p>No matching skills.</p>}
      </section>
    </>}
  </div>;
}
