import {useEffect} from 'react';
import {Link, Navigate, useLocation, useParams} from 'react-router-dom';
import {SeasonStatus} from '../components/SeasonalLobby';
import SeasonalIllustration from '../components/SeasonalIllustration';
import ContestChecklist from '../components/ContestChecklist';
import MonthlyContest from '../components/MonthlyContest';
import {BUILD_CHECKLIST, OCTOBER_CONTESTS, SECURITY_CHECKLIST} from '../seasonalContests';

export default function Challenges() {
  const {contest} = useParams();
  const {hash} = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'});
  }, [hash, contest]);
  if (!contest) return <Navigate to={`/${hash || '#contests'}`} replace/>;
  if (!['spooky-secrets','security-bug-hunt'].includes(contest)) return <section className="contest-hub-heading"><h1>Choose an October contest.</h1><Link className="season-button" to="/#contests">Back to contests</Link></section>;
  const security = contest === 'security-bug-hunt';
  return <div className={`contest-detail ${security ? 'is-security' : 'is-build'}`}>
    <Link className="contest-back" to="/#contests">All contests</Link>
    <header className="contest-detail-hero">
      <div className="contest-detail-illustration"><SeasonalIllustration scene={security ? 'bug' : 'vault'}/></div>
      <div className="contest-detail-copy"><span className="season-eyebrow">{security ? 'THE OOTLEJUICE SIDEQUEST / BONUS CONTEST' : 'OCTOBER BUILD CONTEST'}</span><SeasonStatus/>
        <h1>{security ? <>Security<br/><em>Bug Hunt.</em></> : <>Spooky<br/><em>Secrets.</em></>}</h1>
        <p>{security ? 'Find security flaws in Tari Ootle. Reproduce them on your own infrastructure, then report privately.' : 'A haunted game. A mysterious app. A secret worth keeping. Build a confidential concoction that shows what Tari’s privacy tools can do.'}</p>
        <div className="season-hero-actions"><a className="season-button" href={security ? '#hunt-workspace' : '#build-workspace'}>{security ? 'Set up your hunt' : 'Plan your entry'} </a><a className="season-text-link" href={security ? OCTOBER_CONTESTS.securityThread : OCTOBER_CONTESTS.buildRules} target="_blank" rel="noreferrer">Official rules</a></div>
      </div>
    </header>
    <div className="contest-facts"><div><span>{security ? 'PLACEMENT BONUSES' : 'TOTAL PRIZE POOL'}</span><strong>1,750,000 <small>XTM</small></strong></div><div><span>ENTRY DEADLINE</span><strong>Nov 1 <small>00:00 UTC</small></strong></div><div><span>{security ? 'REPORTING' : 'THE THEME'}</span><strong>{security ? 'Keep it private.' : 'Programmable privacy.'}</strong></div></div>
    {security ? <SecurityWorkspace/> : <BuildWorkspace/>}
    <section className="contest-official-note"><p>1st: 1,000,000 XTM · 2nd: 500,000 XTM · 3rd: 250,000 XTM. {security && 'Accepted findings also qualify for standard bounties.'}</p><p>Rules checked October 3, 2026. The official contest rules govern eligibility, judging and rewards.</p></section>
  </div>;
}

function BuildWorkspace() {
  return <>
    <div className="contest-workspace" id="build-workspace">
      <section><span className="season-eyebrow">YOUR BUILD PLAN</span><h2>From strange idea<br/>to finished entry.</h2><p className="contest-workspace-lede">Make privacy part of the experience. Show what stays confidential, who can see it, and why it matters to your players or users.</p><ContestChecklist id="spooky-secrets" items={BUILD_CHECKLIST}/></section>
      <aside className="contest-toolbox"><span className="season-eyebrow">KEEP BUILDING</span><h3>Pack your toolkit.</h3><Link to="/ootle-templates">Ootle templates & skills </Link><a href="https://ootle.tari.com/guides/build-a-guessing-game/" target="_blank" rel="noreferrer">Guided guessing-game build </a><a href="/agent-start">Work with your AI agent </a><Link to="/#creator-toolkit">Find a starting point </Link><a href="https://discord.com/invite/dj34vQSe6d" target="_blank" rel="noreferrer">Meet fellow builders </a><a href="https://community.tari.com/c/development/6" target="_blank" rel="noreferrer">Ask the developer community </a></aside>
    </div>
    <MonthlyContest/>
    <section className="contest-share"><div><span className="season-eyebrow">THE COMMUNITY SHOWCASE</span><h2>See what’s taking shape.</h2><p>Explore the official submissions and meet the creators behind them.</p></div><a className="season-button secondary" href={OCTOBER_CONTESTS.buildThread} target="_blank" rel="noreferrer">View build entries</a></section>
  </>;
}

function SecurityWorkspace() {
  return <>
    <div className="contest-workspace" id="hunt-workspace">
      <section><span className="season-eyebrow">YOUR RESEARCH PLAN</span><h2>Good findings<br/>start with good scope.</h2><p className="contest-workspace-lede">Use a local swarm, private network, or unit and integration tests. Public testnet and mainnet infrastructure are outside the contest’s testing permission.</p><ContestChecklist id="security-bug-hunt" items={SECURITY_CHECKLIST}/></section>
      <aside className="contest-toolbox"><span className="season-eyebrow">PINNED TARGET</span><h3>Tari Ootle</h3><p>Only findings present at the contest commit count.</p><code>{OCTOBER_CONTESTS.securityCommit}</code><a href={`https://github.com/tari-project/tari-ootle/tree/${OCTOBER_CONTESTS.securityCommit}`} target="_blank" rel="noreferrer">Open the pinned source </a><a href={OCTOBER_CONTESTS.securityThread} target="_blank" rel="noreferrer">Full scope, tiers & scoring </a><a href={OCTOBER_CONTESTS.privateReporting} target="_blank" rel="noreferrer">Vulnerability disclosure policy </a></aside>
    </div>
    <section className="security-report" id="private-report"><div><span className="season-eyebrow">FOUND SOMETHING?</span><h2>Private report.<br/>Real impact.</h2><p>Submit one root cause per GitHub private security advisory. Start the title with <code>[Bug Hunt]</code>. Include your own analysis and a working proof of concept.</p><a className="season-button" href={OCTOBER_CONTESTS.privateReporting} target="_blank" rel="noreferrer">Open private reporting </a><p className="security-report-alternative">Can’t use GitHub? <a href="mailto:security@tari.com?subject=%5BBug%20Hunt%5D%20">Email security@tari.com</a></p></div><aside><h3>Keep your discovery confidential.</h3><p>Finding details belong only in the official submission channel. Don’t post them in public chats, public repositories, or the build-contest thread.</p><p>Disclosure stays embargoed until the fix and advisory ship, or 60 days after reporting, whichever is later.</p><a href={OCTOBER_CONTESTS.securityThread + '#p-1653-submission-8'} target="_blank" rel="noreferrer">Review the report requirements</a></aside></section>
  </>;
}
