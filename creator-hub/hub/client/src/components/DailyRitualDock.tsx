import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import DailyTrivia, {SparkBalance} from './DailyTrivia';
import CommunityLinks from './CommunityLinks';
import {LaunchTicket} from './OotleLaunch';
import './DailyRitualDock.css';

export default function DailyRitualDock() {
  const dock = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const closeRitual = () => {
    setOpen(false);
    dock.current?.querySelector<HTMLButtonElement>('.spark-balance')?.focus({preventScroll: true});
  };
  useEffect(() => {
    const requested = location.hash === '#daily-spark';
    setOpen(requested);
    if (requested) setHasOpened(true);
  }, [location.key, location.hash]);
  useLayoutEffect(() => {
    const element = dock.current;
    const header = element?.closest('.site-header');
    if (!element || !header) return;
    const measure = () => element.style.setProperty('--ritual-header-height', `${header.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  return <div ref={dock} className="container ritual-dock" id="daily-spark" data-open={open} onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      closeRitual();
    }
  }}>
    <div className="season-utility">
      <LaunchTicket/><CommunityLinks/>
      <SparkBalance open={open} onToggle={() => {setOpen(!open); setHasOpened(true);}}/>
    </div>
    <div id="daily-ritual-panel" className="ritual-dock-content" hidden={!open}>
      {hasOpened && <DailyTrivia sectionId="daily-ritual-game"/>}
    </div>
  </div>;
}
