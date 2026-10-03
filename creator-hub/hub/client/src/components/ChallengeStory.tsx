import {useState} from 'react';
import {Link} from 'react-router-dom';
import './ChallengeStory.css';

export type ChallengeEdition = {
  id: string; number: number; title: string; brief: string; metric: string;
  evidence: string; startDate: string; endDateExclusive: string; phase: string;
  target: number; submitted: number; verified: number; rewardStatus: string;
};

const STEPS = [
  {label: 'Make it click', title: 'One action. A satisfying result.', description: 'A jump that lands. A beat that drops. A tool that saves time. Start with one thing that feels good.'},
  {label: 'Show it working', title: 'Make the idea playable.', description: 'Publish a project version and a short demo. Show the action, its result, and how you know it works.'},
  {label: 'Grow it together', title: 'Your small build adds up.', description: 'Submit your project and evidence for review. Accepted contributions move the shared community goal forward.'},
];

export default function ChallengeStory({edition}: {edition: ChallengeEdition}) {
  const [step, setStep] = useState(0);
  const [loops, setLoops] = useState(0);
  const active = STEPS[step];
  const closingDate = new Date(`${edition.endDateExclusive}T00:00:00Z`);
  closingDate.setUTCDate(closingDate.getUTCDate() - 1);
  const deadline = closingDate.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', timeZone:'UTC'});
  const progress = Math.min(100, Math.max(0, edition.verified / Math.max(1, edition.target) * 100));
  return <article className="challenge-story">
    <div className="challenge-event-banner"><span>WEEK {String(edition.number).padStart(2, '0')} · CREATOR CHALLENGE</span><span className="challenge-open"><i aria-hidden="true" />{edition.phase === 'open' ? 'Open for submissions' : edition.phase === 'upcoming' ? 'Coming soon' : 'Completed'}</span></div>
    <header className="challenge-story-heading">
      <div className="challenge-event-copy"><span className="challenge-kicker">YOUR MISSION THIS WEEK</span><h2>{edition.title}</h2><p>{edition.brief}</p>
        <div className="challenge-join-row"><Link className="btn challenge-join" to="/challenges#submit">Join this week’s challenge <span aria-hidden="true">↗</span></Link><Link to="/create">Find a starting point →</Link></div>
        <span className="challenge-tools-note">Any tools · AI welcome · Games + apps · Solo or together</span>
      </div>
      <div className="challenge-deadline"><span>MAKE IT. SHOW IT. SHARE IT.</span><strong>7<span> DAY CHALLENGE</span></strong><div className="challenge-story-date">Submit by {deadline}<small>11:59 pm · New York time</small></div><p>A new prompt every Monday.<br/>Your next idea starts here.</p></div>
    </header>
    <div className="challenge-story-body">
      <div className="challenge-story-demo" data-step={step}>
        <span className="challenge-demo-label">NEED A SPARK? TRY THIS MINI DEMO</span>
        <div className="challenge-loop-art" aria-hidden="true">
          <svg viewBox="0 0 480 240"><defs><linearGradient id={`loop-${edition.id}`}><stop stopColor="#bba0ff"/><stop offset="1" stopColor="#dcfa50"/></linearGradient></defs><path className="loop-track" d="M100 120 C100 15 380 15 380 120 S100 225 100 120"/><path className="loop-flow" stroke={`url(#loop-${edition.id})`} d="M100 120 C100 15 380 15 380 120 S100 225 100 120"/><circle cx="100" cy="120" r="42"/><circle cx="380" cy="120" r="42"/><text x="100" y="130">↗</text><text x="380" y="130">✦</text><text className="loop-art-label" x="100" y="191">ACTION</text><text className="loop-art-label" x="380" y="191">RESULT</text></svg>
          {loops > 0 && <span key={loops} className="challenge-loop-burst">✦</span>}
          <div className="challenge-loop-core"><strong>{loops > 0 ? 'Nice.' : 'What if?'}</strong><span>{loops > 0 ? 'That feeling? Build on it.' : 'A little input. A real impact.'}</span></div>
        </div>
        <button className="challenge-loop-button" onClick={() => setLoops(count => count + 1)}>{loops > 0 ? 'Feel it again' : 'Try the loop'} <span aria-hidden="true">↗</span></button>
        <p className="challenge-demo-status" aria-live="polite">{loops > 0 ? `${loops} ${loops === 1 ? 'spark' : 'sparks'} made in this demo. Your turn to build one.` : 'Tap to turn an action into a spark.'}</p>
        <span className="challenge-demo-footnote">Interactive example · does not submit a contribution</span>
      </div>
      <div className="challenge-story-explainer">
        <nav className="challenge-story-steps" aria-label="Explore the challenge journey">{STEPS.map((item, index) => <button key={item.label} aria-pressed={step === index} onClick={() => setStep(index)}><span>0{index + 1}</span>{item.label}<span aria-hidden="true">{step === index ? '↙' : '↗'}</span></button>)}</nav>
        <div className="challenge-step-copy" aria-live="polite"><span className="challenge-kicker">{String(step + 1).padStart(2, '0')} / THE IDEA</span><h3>{active.title}</h3><p>{active.description}</p></div>
        <Link className="challenge-secondary" to="/challenges#submit">Ready? Submit your build →</Link>
      </div>
    </div>
    <footer className="challenge-community">
      <div><span className="challenge-kicker">SMALL BUILDS. SHARED MOMENTUM.</span><h3>Let’s ship {edition.target} builds together.</h3><p>{edition.evidence}</p></div>
      <div className="challenge-community-meter"><div className="challenge-community-count"><strong>{edition.verified}<span> / {edition.target}</span></strong><span>verified contributions</span></div><div className="challenge-community-track" role="progressbar" aria-label="Verified community contributions" aria-valuemin={0} aria-valuemax={Math.max(edition.target, edition.verified)} aria-valuenow={edition.verified}><span style={{width: `${progress}%`}}/></div><p>{edition.submitted} awaiting review <span>·</span> Pilot goal, no funded prize</p><Link to="/challenges#rewards">How community unlocks work ↗</Link></div>
    </footer>
  </article>;
}
