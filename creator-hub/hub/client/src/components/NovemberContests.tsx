import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {webImage} from '../imageVariants';
import {NOVEMBER_CONTESTS, novemberContestPhase, novemberContestTiming, type NovemberContest} from '../novemberContests';
import './NovemberContests.css';

function useContestClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer);}, []);
  return now;
}

export function NovemberHero() {
  return <section className="november-hero" aria-labelledby="season-title">
    <div><p className="november-eyebrow">NOVEMBER AT TARI</p>
      <h1 id="season-title">Build it. Launch it.<br/><em>Make some noise.</em></h1>
      <p>Three contests. Your next MVP, mainnet debut or story about Tari starts here.</p>
      <a className="season-button" href="#contests">Find your contest</a>
    </div>
    <img src={webImage('/seasonal/october-2026/witch-builder-scene.png').src} width="1536" height="1024" alt="Tari turtle and ghost building together with colorful code blocks" fetchPriority="high" decoding="async"/>
  </section>;
}

export function NovemberContestCards() {
  const now = useContestClock();
  return <section className="november-contests" id="contests" aria-labelledby="november-contests-title">
    <div className="november-heading"><h2 id="november-contests-title">Pick your <em>play.</em></h2><span>November 2026</span></div>
    <div className="november-grid">{NOVEMBER_CONTESTS.map((contest, index) =>
      <Link className={`november-card november-card-${index + 1}`} key={contest.slug} to={`/challenges/${contest.slug}`}>
        <span className="november-eyebrow">{contest.category}</span>
        <h3>{contest.title}<br/><em>{contest.accent}</em></h3>
        <p>{contest.description}</p>
        <div className="november-prize"><strong>{contest.prize}</strong><span>{contest.prizeNote}</span></div>
        <span className="november-timing">{novemberContestTiming(contest, now)}</span>
        <span className="november-card-action">{novemberContestPhase(contest, now) === 'closed' ? 'View contest & entries' : contest.action}</span>
      </Link>
    )}</div>
    <aside className="ongoing-bounty" id="ongoing-bounty" aria-labelledby="ongoing-bounty-title">
      <div><span className="november-eyebrow">Ongoing</span><h3 id="ongoing-bounty-title">Tari bug <em>bounty.</em></h3><p>Find a security issue? Report it privately.</p></div>
      <div className="ongoing-bounty-reward"><strong>15,000–250,000 XTM</strong><span>Guideline rewards · Eligibility and severity review apply.</span></div>
      <a className="season-button" href="https://github.com/tari-project/tari-ootle/security" target="_blank" rel="noreferrer">View scope &amp; report</a>
    </aside>
    <p className="november-archive">Explore submissions: <Link to="/#october-submissions">Spooky Secrets submissions</Link><span aria-hidden="true"> · </span><Link to="/challenges/security-bug-hunt">Security Bug Hunt · Closed, results pending</Link><span aria-hidden="true"> · </span><Link to="/#creator-submissions">Creator submissions</Link></p>
  </section>;
}

export function NovemberContestDetail({contest}: {contest: NovemberContest}) {
  const now = useContestClock();
  const closed = novemberContestPhase(contest, now) === 'closed';
  return <article className="november-detail">
    <Link className="november-back" to="/#contests">All contests</Link>
    <header className="november-detail-heading">
      <div><p className="november-eyebrow">NOVEMBER 2026 · {contest.category}</p><h1>{contest.title}<br/><em>{contest.accent}</em></h1><p>{contest.description}</p></div>
      <aside><strong>{contest.prize}</strong><p>{contest.prizeNote}</p><span>{novemberContestTiming(contest, now)}</span>
        <a className="season-button" href={contest.threadUrl} target="_blank" rel="noreferrer">{closed ? 'View official entries' : contest.slug === 'first-to-launch' ? 'Open bonus thread' : 'Enter on the forum'}</a>
      </aside>
    </header>
    {contest.slug === 'first-to-launch' && <p className="november-cutoff-note">The organizer’s announcement contains conflicting cutoff dates and times. The final deadline is awaiting clarification; check the official thread for updates.</p>}
    <div className="november-detail-body">
      <section aria-labelledby="november-entry-title"><h2 id="november-entry-title">{closed ? 'How entries worked' : 'How to enter'}</h2><ol>{contest.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <p className="november-forum-help">New to the forum? <a href="https://community.tari.com/signup" target="_blank" rel="noreferrer">Create an account</a>, then reply in the contest thread.</p>
      </section>
      <aside className="november-detail-aside">
        {contest.slug === 'november-mvp' && <><h2>Give it a head start.</h2><p>Past contest code is fair game this month. Bring something new to it.</p><Link to="/#october-submissions">Explore October’s builds</Link><Link to="/ootle-templates">Find a template</Link><a href="https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1" target="_blank" rel="noreferrer">General rules & eligibility</a><p>Already posted your entry?</p><Link className="season-button secondary" to="/submit?contest=november">Share it in the Lobby</Link></>}
        {contest.slug === 'first-to-launch' && <><h2>Ready for mainnet?</h2><p>Ootle launches November 11. Contract publication time determines placement; a fast forum reply does not.</p><a href="https://ootle.tari.com/" target="_blank" rel="noreferrer">Ootle developer docs</a><Link to="/challenges/november-mvp">See the MVP contest</Link></>}
        {contest.slug === 'launch-creator' && <><h2>What earns points?</h2><table aria-label="Creator contest points by platform and format"><thead><tr><th scope="col">Format</th><th scope="col">Points</th></tr></thead><tbody><tr><td>YouTube long-form</td><td>30</td></tr><tr><td>YouTube Shorts</td><td>15</td></tr><tr><td>Reddit, Medium or eligible blog</td><td>10</td></tr><tr><td>Bluesky short-form</td><td>3</td></tr></tbody></table><p>For the blog tier, use your own established blog or a dedicated Tari site. Otherwise, publish long-form on Reddit or Medium.</p><p>Memes and graphics qualify as short-form. X alone earns no points; there is no speed bonus.</p></>}
      </aside>
    </div>
    <p className="november-source-note">Checked November 2, 2026. <a href={contest.threadUrl} target="_blank" rel="noreferrer">Official organizer rules</a> govern eligibility, judging and rewards.</p>
  </article>;
}
