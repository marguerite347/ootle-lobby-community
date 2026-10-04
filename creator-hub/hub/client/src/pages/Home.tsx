import {OfficialProjects} from '../components/ExternalCommunityProjects';
import PublicationGallery from '../workbench/PublicationGallery';
import {useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import WorkbenchWordmark from '../components/WorkbenchWordmark';
import ConcoctionArt from '../components/ConcoctionArt';
import ContestProjects from '../components/ContestProjects';
import OctoberSubmissions from '../components/OctoberSubmissions';
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
    <OctoberSubmissions/>
    <div id="community-entries"><ContestProjects/></div>
    <PublicationGallery destination="community" section/><OfficialProjects/>
    <section className="season-community" id="creator-community">
      <div className="season-community-copy">
        <h2>Brew something<br/>brilliant.</h2>
        <p>Build in Ootle Workbench. Trade ideas on Discord. Share your creation with the community.</p>
        <div className="season-community-actions">
          <Link className="season-button workbench-cta" to="/workbench" aria-label="Open Ootle Workbench"><img src="/ootle-jam-mark.svg" alt="" width="28" height="28"/><WorkbenchWordmark/></Link>
          <div className="season-community-actions">
            <a className="season-text-link" href="https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396" target="_blank" rel="noreferrer">Contest thread</a>
            <a className="season-text-link" href="https://discord.com/invite/dj34vQSe6d" target="_blank" rel="noreferrer">Join Tari on Discord</a>
          </div>
        </div>
      </div>
      <img className="season-community-ghost" src="/seasonal/october-2026/creator-ghost.png" alt="A friendly ghost waving and carrying a glowing code block" width="1254" height="1254" loading="lazy"/>
    </section>
  </div>;
}
