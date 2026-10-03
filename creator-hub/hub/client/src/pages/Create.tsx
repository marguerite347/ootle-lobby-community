import CreatorJourney from '../components/CreatorJourney';
import BuildToolkit from '../components/BuildToolkit';
import CreatorIdeas from '../components/CreatorIdeas';
import GameStarters from './GameStarters';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type RecipeSummary, type OnboardingSummary } from '../api';
import './Create.css';
import {GameReveal} from '../components/GameKit';
import LobbyTrail from '../components/LobbyTrail';

const routes = [
  { id: 'frameworks', title: 'Their game. Your twist.', description: 'Create a Riff from a game or starter. Keep what works. Change the rules.', icon: '↗' },
  { id: 'goals', title: 'First build? We got you.', description: 'Pick a goal. Get the setup steps and a starter that fits.', icon: '→' },
  { id: 'recipes', title: 'Stack your Tari pieces.', description: 'Open a recipe. See what connects.', icon: '✳' },
];

export default function Create() {
  const [params, setParams] = useSearchParams();
  const view = routes.some(r => r.id === params.get('view')) ? params.get('view')! : ['q','genre','engine','kind'].some(key => params.has(key)) ? 'frameworks' : 'start';
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [goals, setGoals] = useState<OnboardingSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [ideasOpen, setIdeasOpen] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    Promise.all([api.recipes(), api.onboarding()]).then(([r,g]) => {
      if (active) { setRecipes(r.recipes); setGoals(g.paths); }
    }).catch(() => { if (active) setError('We couldn’t load the guided starting points.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  function choose(id: string) {
    const next = new URLSearchParams(params);
    next.set('view', id);
    setParams(next);
  }
  return <div className="create-workbench">
    <LobbyTrail section="Create" />
    <header className="create-hero">
      <div><p className="create-kicker">CREATE</p><h1>Wait. <span>Let me cook.</span></h1><p>New games are on the way. Start a blank project, or open Studio to shape a blueprint. A Studio save is a draft, not a published playable.</p></div>
      <div className="create-hero-actions"><a className="btn primary" href="/create/project">New blank project</a><a href="/studio">Open Studio</a></div>
    </header>
    {view === 'start' && <CreatorJourney/>}
    <GameReveal><nav className="create-choices" aria-label="Choose your starting path">
      {routes.map((r,i) => <button key={r.id} aria-pressed={view === r.id} onClick={() => choose(r.id)} aria-controls="create-starting-content"><span className="create-choice-number">0{i+1}<span aria-hidden="true">{r.icon}</span></span><strong>{r.title}</strong><span>{r.description}</span><small>{view === r.id ? 'This is your route' : 'Take this route →'}</small></button>)}
    </nav></GameReveal>
    <div id="create-starting-content">
      {view === 'start' ? <section className="create-start-prompt"><p>Choose a path above to open its setup. A saved project keeps its versions, references, and workflow. <Link to="/explore">Compare resources in Discover</Link>.</p></section> : view === 'frameworks' ? <GameStarters /> : <section className="create-guided" aria-label={view === 'recipes' ? 'Tari compositions' : 'Guided setups'}>
        <div className="create-section-title"><div><p className="create-kicker">{view === 'recipes' ? 'NATIVE BUILDING BLOCKS' : 'A LITTLE DIRECTION'}</p><h2>{view === 'recipes' ? 'Build from a composition.' : 'What do you want to create?'}</h2></div><Link to="/learn">Find a guide ↗</Link></div>
        <p className="create-section-copy">{view === 'recipes' ? 'Recipes show how Tari parts connect. Open one to inspect its components, configure parameters, and see what still needs implementation.' : 'Pick a goal for recommended starting points, setup instructions, and relevant learning resources.'}</p>
        {loading ? <p role="status">Loading starting points…</p> : error ? <div className="panel" role="alert"><p>{error}</p><button className="btn" onClick={() => setRetry(n => n+1)}>Try again</button></div> : <div className="create-path-grid">
          {view === 'recipes' ? recipes.map(r => <Link className="create-path-card" key={r.id} to={`/create/recipe/${encodeURIComponent(r.id)}`}><span className="badge">{r.status}</span><h3>{r.title}</h3><p>{r.description}</p><small>{r.componentCount} components · {r.verifiedTestnet ? 'Testnet verified' : 'Execution not verified'}</small><strong>Inspect & configure →</strong></Link>) : goals.map(g => <Link className="create-path-card" key={g.id} to={`/create/goal/${encodeURIComponent(g.id)}`}><span className="create-kicker">{g.ecosystem === 'tari-ootle' ? 'TARI OOTLE' : g.ecosystem}</span><h3>{g.goal}</h3><p>{g.blurb}</p><strong>See the setup →</strong></Link>)}
          {!(view === 'recipes' ? recipes.length : goals.length) && <p>No starting points are available yet. <Link to="/learn">Explore the library →</Link></p>}
        </div>}
      </section>}
    </div>
    <p className="sub">Working with an agent or generating media? <a href="/agent-start#setup-and-access-check-before-you-start">Check accounts, licenses, and tools first</a>.</p>
    <Link className="studio-entry" to="/studio"><span className="eyebrow">LATER, IF YOU NEED A BLUEPRINT</span><h2>Map characters, assets, and game logic.</h2><p>Arrange them in editable blueprints. A Studio save is a draft. It does not publish a playable.</p><span className="studio-entry-cta">Open Studio <span aria-hidden="true">↗</span></span></Link>
    <BuildToolkit projectId={params.get('setupProject') || ''} />
    <section className="create-tools" aria-label="Tools for your project"><div className="create-tools-heading"><p className="create-kicker">BUILD YOUR LOADOUT</p><h2>Tools for this build.</h2><p>Find what you need to make it yours and prepare a version others can riff on.</p></div><Link to="/create/assets"><span aria-hidden="true">◈</span><div><strong>Assets & creation tools</strong><small>Find packs, create assets, or upload your own</small></div><span aria-hidden="true">↗</span></Link><Link to="/create/video"><span aria-hidden="true">▷</span><div><strong>Capture & promote</strong><small>Prepare a branded video for your project</small></div><span aria-hidden="true">↗</span></Link>
      <button className="create-ideas-toggle" aria-expanded={ideasOpen} aria-controls="create-ideas-panel" onClick={() => setIdeasOpen(open => !open)}>
        <span aria-hidden="true">✳</span><div><strong>New Lore ideas</strong><small>Find inspiration for your next build or weekly challenge</small></div><span aria-hidden="true">{ideasOpen ? '−' : '+'}</span>
      </button>
      <div id="create-ideas-panel" className="create-ideas-panel" hidden={!ideasOpen}>{ideasOpen && <CreatorIdeas />}</div>
    </section>
    <p className="create-kit-link"><Link className="btn" to="/create/ui-kit">Try the game UI kit ↗</Link> <span>Reusable motion, progress and success effects for your project.</span></p><footer className="create-next"><div><h2>Save a foundation. Organize the tools.</h2><p>Choose a foundation, save a project, then use its editable workflow to organize templates, assets, and tools. Test the connections before sharing a version for others to riff on.</p></div><Link className="btn" to="/skills/templates-composability">Learn composability →</Link></footer>
  </div>;
}
