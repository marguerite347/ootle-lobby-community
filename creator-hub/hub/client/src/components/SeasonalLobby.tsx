import {useEffect, useState} from 'react';
import './ContestHologram.css';
import {Link} from 'react-router-dom';
import SeasonalIllustration from './SeasonalIllustration';
import {octoberContestStatus} from '../seasonalContests';

export function SeasonStatus() {
  const [status, setStatus] = useState(octoberContestStatus());
  useEffect(() => {
    const timer = setInterval(() => setStatus(octoberContestStatus()), 60000);
    return () => clearInterval(timer);
  }, []);
  return <span className="season-status"><i aria-hidden="true"/>{status}</span>;
}

export function ContestCards() {
  return <section className="contest-paths" id="contests" aria-labelledby="contest-paths-title">
    <div className="season-section-heading"><div><h2 id="contest-paths-title">Give that idea <em>a pulse.</em></h2></div><span className="season-deadline">Closes November 1 · 00:00 UTC</span></div>
    <div className="quest-grid">
      <div className="quest-option"><p className="quest-number"><span>01</span> Build contest</p>
      <Link className="quest-card quest-build" to="/challenges/spooky-secrets">
        <div className="quest-art"><SeasonalIllustration scene="vault"/></div>
        <h3><span>Spooky</span> <em>Secrets.</em></h3><p>A haunted game. A mysterious app.<br/>A secret worth keeping.</p>
        <div className="quest-prize"><strong>1,750,000 <small>XTM</small></strong><span>Total prize pool</span></div>
        <span className="quest-link">Open the creator brief </span>
      </Link></div>
      <div className="quest-option"><p className="quest-number"><span>02</span> Bonus contest</p>
      <Link className="quest-card quest-security" to="/challenges/security-bug-hunt">
        <div className="quest-art"><SeasonalIllustration scene="bug"/></div>
        <h3><span>Security</span> <em>Bug Hunt.</em></h3><p><strong className="quest-campaign-line">The Ootlejuice sidequest.</strong>Help catch Ootle’s bugs in this bonus Security Bug Hunt.</p>
        <div className="quest-prize"><strong>1,750,000 <small>XTM</small></strong><span>Placement bonuses + standard bounties</span></div>
        <span className="quest-link">Explore the hunt </span>
      </Link></div>
    </div>
  </section>;
}

export function CreatorResources() {
  return <section className="season-resources" id="creator-toolkit" aria-labelledby="season-resources-title">
    <div className="resource-feature">
      <div className="builder-art"><SeasonalIllustration scene="builder"/></div>
      <div className="resource-feature-copy">
        <h2 id="season-resources-title">Start with a template.<br/><em>Make it yours.</em></h2>
        <p>A guessing game, a private app, a collectible with a secret. Find your starting point in Tari’s templates.</p>
        <div className="resource-feature-actions">
          <a className="season-button" href="https://github.com/tari-project/wasm-template/tree/main/wasm_templates" target="_blank" rel="noreferrer">Explore templates </a>
          <a className="season-text-link" href="https://ootle.tari.com/guides/build-a-guessing-game/" target="_blank" rel="noreferrer">Follow the guessing-game guide</a>
        </div>
      </div>
    </div>
  </section>;
}
