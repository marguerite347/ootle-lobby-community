import {safeHref} from '../../../shared/safeLinks.mjs';
import BuildToolkit from './BuildToolkit';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import './CreatorIdeas.css';

export type CreatorIdea = {
  id:string; title:string; kind:string; question:string; observation:string;
  build:string; success:string; sourceUrl:string; reviewedAt:string;
  goalTitles:string[]; brief:string; resources:{label:string;url:string}[];
};
type WeeklyIdeas = {weekOf:string; nextWeek:string; mode:string; lastReviewedAt:string|null; ideas:CreatorIdea[]};
export async function fetchCreatorIdeas(): Promise<WeeklyIdeas> {
  const response = await fetch('/api/creator-ideas', {cache:'no-store'});
  if (!response.ok) throw new Error('Could not load the insight log.');
  return response.json();
}

export default function CreatorIdeas() {
  const [data,setData] = useState<WeeklyIdeas|null>(null);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [revision,setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    fetchCreatorIdeas().then(result => {if(active) setData(result);})
      .catch(() => {if(active) setError('Suggestions are unavailable. Try refreshing the log.');});
    return () => {active = false;};
  },[revision]);
  async function copy(idea:CreatorIdea) {
    try {await navigator.clipboard.writeText(idea.brief); setNotice(`Copied “${idea.title}”.`);}
    catch {setNotice('Copy unavailable. Open the brief below and select its text.');}
  }
  return <section className="creator-ideas" aria-labelledby="creator-ideas-title">
    <div className="create-section-title"><div><p className="create-kicker">NEW LORE → COMMUNITY CHALLENGES</p>
      <h2 id="creator-ideas-title">What if we built this?</h2></div>
      <button className="btn" onClick={() => setRevision(value => value + 1)}>Refresh insights ↻</button></div>
    <p className="create-section-copy">Turn what people need to understand into something they can play, use or riff on. These proposals connect New Lore questions to our creator goals.</p>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p role="status">Reading the insight log…</p>}
    {data && <><p className="sub">Week of {data.weekOf} · Next rotation {data.nextWeek} (UTC)<br />Curated log reviewed {data.lastReviewedAt || 'not yet'} · Refresh reads saved insights; it does not query New Lore or spend AI credits.</p>
      {!data.ideas.length && <p>No current reviewed suggestions. The insight log needs a new review before another challenge is proposed.</p>}
      <div className="creator-ideas-grid">{data.ideas.map(idea => <article key={idea.id} className="creator-idea">
        <span className="badge">{idea.kind} · Proposal</span><h3>{idea.title}</h3><p>{idea.question}</p>
        <p className="creator-idea-goal">{idea.goalTitles.join(' · ')}</p>
        <h4>The small first build</h4><p>{idea.build}</p><h4>What success looks like</h4><p>{idea.success}</p>
        <div className="creator-idea-links">{idea.resources.map(resource => <Link key={resource.url} to={resource.url}>{resource.label} ↗</Link>)}</div>
        <details><summary>Evidence & ready-to-edit challenge copy</summary><p>{idea.observation}</p><a href={safeHref(idea.sourceUrl)} target="_blank" rel="noreferrer">Read the New Lore question ↗</a><p>Reviewed {idea.reviewedAt}</p><pre>{idea.brief}</pre></details>
        <BuildToolkit initialIdea={`${idea.title}. ${idea.build}`.slice(0,600)}/>
        <div className="creator-idea-actions"><button className="btn" onClick={() => copy(idea)}>Copy challenge brief</button><Link to={`/create/project?idea=${encodeURIComponent(idea.id)}`}>Start this idea →</Link></div>
      </article>)}</div>
      <p className="sub">Drafts for the weekly challenge plan. No challenge is published, and no reward is promised, by refreshing or copying a suggestion.</p>
    </>}
    <p role="status" aria-live="polite">{notice}</p>
  </section>;
}
