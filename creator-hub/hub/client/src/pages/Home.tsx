import {OfficialProjects} from '../components/ExternalCommunityProjects';
import EcosystemResources from '../components/EcosystemResources';
import PublicationGallery from '../workbench/PublicationGallery';
import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {webImage} from '../imageVariants';
import {NovemberHero, NovemberContestCards} from '../components/NovemberContests';
import ContestProjects from '../components/ContestProjects';
import NovemberSubmissions from '../components/NovemberSubmissions';
import OctoberSubmissions from '../components/OctoberSubmissions';
import {CreatorResources} from '../components/SeasonalLobby';
import NetworkProjects from '../components/NetworkProjects';

export default function Home() {
  const {hash, search, key} = useLocation();
  useEffect(() => {
    const target = ['#my-projects', '#build-ideas'].includes(hash) ? 'creator-toolkit'
      : ['#november-mvp-submissions', '#first-to-launch-submissions', '#creator-submissions'].includes(hash) ? 'november-submissions' : hash.slice(1);
    if (hash) document.getElementById(target)?.scrollIntoView({block: 'start'});
  }, [hash, search, key]);
  return <div className="season-home creator-workspace">
    <NovemberHero/>
    <NetworkProjects/>
    <NovemberContestCards/>
    <NovemberSubmissions/>
    <CreatorResources compact/>
    <OctoberSubmissions/>
    <div id="community-entries"><ContestProjects/></div>
    <PublicationGallery destination="community" section/><OfficialProjects/>
    <EcosystemResources/>
    <section className="season-community" id="creator-community">
      <div className="season-community-copy">
        <h2>Make something<br/>worth sharing.</h2>
        <p>Trade ideas on Discord. Share your creation and follow other builders on the forum.</p>
        <div className="season-community-actions">
          <a className="season-button" href="https://community.tari.com/" target="_blank" rel="noreferrer">Join the community</a>
          <div className="season-community-actions">
            <a className="season-text-link" href="https://community.tari.com/t/november-build-contest-thread-mvp/520" target="_blank" rel="noreferrer">November build contest</a>
            <a className="season-text-link" href="https://discord.com/invite/dj34vQSe6d" target="_blank" rel="noreferrer">Join Tari on Discord</a>
          </div>
        </div>
      </div>
      <img className="season-community-ghost" src={webImage('/seasonal/october-2026/creator-ghost.png').src} alt="A friendly ghost waving and carrying a glowing code block" width="1254" height="1254" loading="lazy" decoding="async"/>
    </section>
  </div>;
}
