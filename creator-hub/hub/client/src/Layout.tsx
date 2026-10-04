import {TriviaProvider,SparkBalance} from './components/DailyTrivia';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {Suspense, useEffect} from 'react';
import DailyRitualDock from './components/DailyRitualDock';
import CommunityLinks from './components/CommunityLinks';
import WorkbenchWordmark from './components/WorkbenchWordmark';
import {LaunchTicket} from './components/OotleLaunch';
import './components/LobbyHeader.css';
import './Shell.css';

import {HubMotion} from './HubMotion';
import ChatSidebar, { isChatPopOutWindow } from './chat/ChatSidebar';

export default function Layout() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo({top: 0, behavior: 'instant'});
  }, [location.pathname, location.hash, location.key]);
  if (isChatPopOutWindow()) return <ChatSidebar />;
  return (
    <TriviaProvider>
      <div className="season-shell"><a className="skip-link" href="#main-content">Skip to content</a><HubMotion/>
      <ChatSidebar />
      <header className="site-header season-header">
        <div className={`container lobby-nav-grid${location.pathname === '/' ? ' has-ritual' : ''}`}>
          <Link to="/" className="season-brand" aria-label="Ootle Lobby home"><img src="/ootle-jam-mark.svg" alt="" width="40" height="40"/><span>ootle<span className="season-brand-light">lobby</span><small>BUILT ON TARI</small></span></Link>
          <CommunityLinks/>
          <SparkBalance/>
          <Link className="season-header-create workbench-brand-link" to="/workbench" aria-label="Open Ootle Workbench"><img src="/ootle-jam-mark.svg" alt="" width="26" height="26"/><WorkbenchWordmark/></Link>
          <LaunchTicket/>
          {location.pathname === '/' && <DailyRitualDock/>}
        </div>
      </header>
      <main className="container" id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="route-loading" role="status"><span/>Opening your workspace…</div>}><Outlet /></Suspense>
      </main>
      <footer className="footer season-footer"><div className="container">
          <div><Link className="season-footer-brand" to="/">ootle lobby</Link></div>
          <nav aria-label="Footer navigation"><Link to="/#contests">Contests</Link><Link to="/#creator-community">Connect & share</Link><Link to="/explore">Discover</Link><Link to="/learn">Learn</Link><Link to="/sources">Sources</Link><Link to="/build-feedback">Feedback</Link><a href="https://github.com/marguerite347/ootle-lobby-community" target="_blank" rel="noreferrer">Contribute on GitHub</a><a href="https://community.tari.com/" target="_blank" rel="noreferrer">Tari community</a></nav>
          <small>Community preview</small><div className="header-effects" data-effects-slot />
        </div></footer></div>
    </TriviaProvider>
  );
}
