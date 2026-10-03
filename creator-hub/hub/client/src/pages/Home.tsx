import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import ConcoctionArt from '../components/ConcoctionArt';
import ContestProjects from '../components/ContestProjects';
import {ContestCards, CreatorResources, SeasonStatus} from '../components/SeasonalLobby';

export default function Home() {
  const {hash, search} = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(['#my-projects', '#build-ideas'].includes(hash) ? 'creator-toolkit' : hash.slice(1))?.scrollIntoView({block: 'start'});
  }, [hash, search]);
  return <div className="season-home creator-workspace">
    <section className="season-hero" aria-labelledby="season-title">
      <ConcoctionArt/>
      <div className="season-hero-copy">
        <div className="season-hero-kicker"><SeasonStatus/></div>
        <h1 id="season-title">Create a<br/>confidential<br/><em>concoction.</em></h1>
        <p>A haunted game. A mysterious app. A secret worth keeping. Spooky Secrets is your excuse to see what Tari’s privacy tools can do.</p>
        <div className="season-hero-actions"><a className="season-button" href="#contests">Find your contest </a></div>
      </div>
    </section>
    <ContestCards/>
    <CreatorResources/>
    <div id="community-entries"><ContestProjects/></div>
    <section className="season-community" id="creator-community">
      <div className="season-community-copy">
        <h2>Brew something<br/>brilliant.</h2>
        <p>Trade ideas on Discord. Share your build in the contest thread.</p>
        <div className="season-community-actions"><a className="season-button" href="https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396" target="_blank" rel="noreferrer">See you in the contest thread </a><a className="season-text-link" href="https://discord.com/invite/dj34vQSe6d" target="_blank" rel="noreferrer">Join Tari on Discord</a></div>
      </div>
      <img className="season-community-ghost" src="/seasonal/october-2026/creator-ghost.png" alt="A friendly ghost waving and carrying a glowing code block" width="1254" height="1254" loading="lazy"/>
    </section>
  </div>;
}
