import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import creatorSubmissions from '../../../../../content/creator-submissions/launch-2026.json';
import {NOVEMBER_CONTESTS} from '../novemberContests';
import {ContestGallery, type ReviewedContest} from './ContestGallery';
import CollapsibleProjects from './CollapsibleProjects';
import CreatorSubmissions from './CreatorSubmissions';
import './NovemberSubmissions.css';

const galleries = [
  {id:'november-2026', anchor:'november-mvp-submissions', label:'MVP builds', title:'November MVP builds', empty:'Your MVP could be first.', description:'Post your entry on the forum, then share it here for a Lobby listing.', action:'Enter your MVP'},
  {id:'first-to-launch-2026', anchor:'first-to-launch-submissions', label:'First to Launch', title:'First to Launch', empty:'The mainnet starting line.', description:'Launch submissions will appear here after Ootle goes live. Explore the requirements while you build.', action:'See launch requirements'},
  {id:'launch-creator', anchor:'creator-submissions', label:'Creator posts'},
] as const;

// INTEGRATION_GAP[LOBBY-SUBMISSIONS] (configuration-required): private intake never publishes itself.
export default function NovemberSubmissions() {
  const {hash} = useLocation();
  const activeIndex = Math.max(0, galleries.findIndex(gallery => `#${gallery.anchor}` === hash));
  const active = galleries[activeIndex];
  const [contests, setContests] = useState<ReviewedContest[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/community-content', {signal:controller.signal}).then(response => {
      if (!response.ok) throw new Error('Unavailable');
      return response.json();
    }).then(feed => {
      if (!galleries.slice(0,2).every(gallery => feed.contests?.some((contest:ReviewedContest) => contest.id === gallery.id))) throw new Error('Missing registries');
      setContests(feed.contests);
    }).catch(error => {if (error.name !== 'AbortError') setFailed(true);});
    return () => controller.abort();
  }, []);
  const contest = contests?.find(contest => contest.id === active.id);
  const brief = NOVEMBER_CONTESTS[activeIndex];
  return <section className="section november-submissions" id="november-submissions" aria-labelledby="november-submissions-title">
    <div className="section-head"><div><h2 id="november-submissions-title">November <em>submissions.</em></h2></div></div>
    <nav className="submission-switcher" aria-label="Contest submission galleries">
      {galleries.map(gallery => {
        const count = gallery.id === 'launch-creator' ? creatorSubmissions.entries.length : contests?.find(contest => contest.id === gallery.id)?.entries.length;
        return <Link key={gallery.id} to={`/#${gallery.anchor}`} aria-current={active.id === gallery.id ? 'true' : undefined}>{gallery.label}{count !== undefined && <span>{count}</span>}</Link>;
      })}
    </nav>
    {active.id === 'launch-creator' ? <CreatorSubmissions/> : <div id={active.anchor} className="november-submission-panel">
      {failed ? <p role="status">Submissions couldn’t load. <a href={brief.threadUrl} target="_blank" rel="noreferrer">View the forum thread</a>.</p> : !contest ? <p role="status">Loading submissions…</p> : contest.entries.length ? <>
        <div className="november-gallery-heading"><h3>{active.title}</h3><a href={brief.threadUrl} target="_blank" rel="noreferrer">Contest thread</a></div>
        <CollapsibleProjects label={active.title}><ContestGallery contest={contest}/></CollapsibleProjects>
      </> : <div className="november-submissions-empty"><div><h3>{active.empty}</h3><p>{active.description}</p><small>No entries posted at the {new Date(contest.checkedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})} forum check.</small></div><Link className="season-button" to={`/challenges/${brief.slug}`}>{active.action}</Link></div>}
      {active.id === 'november-2026' && <p className="november-listing-link">Already entered? <Link to="/submit?contest=november">Share your forum post here</Link></p>}
    </div>}
  </section>;
}
