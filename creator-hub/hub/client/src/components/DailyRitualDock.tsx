import {useLayoutEffect, useRef, useState} from 'react';
import DailyTrivia from './DailyTrivia';
import './DailyRitualDock.css';

export default function DailyRitualDock() {
  const dock = useRef<HTMLDetailsElement>(null);
  const closeRitual = () => {
    if (!dock.current) return;
    dock.current.open = false;
    dock.current.querySelector('summary')?.focus({preventScroll: true});
  };
  const [hasOpened, setHasOpened] = useState(false);
  useLayoutEffect(() => {
    const element = dock.current;
    const header = document.querySelector('.site-header');
    if (!element || !header) return;
    const measure = () => {
      element.style.setProperty('--ritual-header-height', `${header.getBoundingClientRect().height}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  return <details ref={dock} className="ritual-disclosure ritual-dock" id="daily-spark" onKeyDown={event => {
    if (event.key === 'Escape' && dock.current?.open) {
      event.preventDefault();
      event.stopPropagation();
      closeRitual();
    }
  }} onToggle={event => {
    if (event.currentTarget.open) setHasOpened(true);
  }}>
    <summary className="ritual-summary">
      <img src="/seasonal/october-2026/ritual-cauldron-v2.png" alt="" width="72" height="72"/>
      <span className="ritual-summary-copy"><strong>Daily Ritual</strong><span>One question. A little magic.</span></span>
      <span className="ritual-summary-action">Play today’s ritual</span>
    </summary>
    {hasOpened && <div className="ritual-dock-content">
      <div className="ritual-dock-toolbar">
        <span>Daily Ritual</span>
        <button type="button" className="ritual-dock-close" onClick={closeRitual}>Close ritual <span aria-hidden="true">×</span></button>
      </div>
      <DailyTrivia sectionId="daily-ritual-game"/>
    </div>}
  </details>;
}
