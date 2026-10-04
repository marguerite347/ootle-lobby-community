import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import QuickSearch from './QuickSearch';

const groups = [
  {title: 'Discover', links: [
    {to: '/#community-entries', label: 'Community projects', hint: 'See what people are building'},
    {to: '/explore', label: 'Resource library', hint: 'Find your next building block'},
    {to: '/learn', label: 'Learn & guides', hint: 'Get started with Ootle'},
  ]},
  {title: 'Community', links: [
    {to: '/challenges', label: 'Challenges', hint: 'Join the next challenge'},
    {to: '/#creator-community', label: 'Connect & share', hint: 'Meet builders and post your work'},
    {to: 'https://github.com/marguerite347/ootle-lobby-community', label: 'Contribute on GitHub', hint: 'Help shape the lobby'},
  ]},
  {title: 'Updates', links: [
    {to: '/blog', label: 'Creator Journal', hint: 'Ideas and stories'},
    {to: '/calendar', label: 'Marketing calendar', hint: 'See what’s coming up'},
    {to: '/growth', label: 'Growth dashboard', hint: 'Track Ootle growth'},
  ]},
];

export default function CreatorStack() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useLayoutEffect(() => {
    const header = root.current?.closest<HTMLElement>('.site-header');
    if (!header) return;
    const measure = () => header.style.setProperty('--lobby-header-height', `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const active = groups.some(group => group.links.some(link =>
    location.pathname === link.to || location.pathname.startsWith(link.to + '/')));
  useEffect(() => {setOpen(false);}, [location.key]);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return <div className="creator-stack" ref={root} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    <button id="creator-stack-trigger" ref={trigger} className={`creator-stack-trigger${active ? ' is-active' : ''}`}
      aria-expanded={open} aria-controls="creator-stack-panel" onClick={() => setOpen(!open)}>
      <span className="stack-label">Explore</span><span className="stack-chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="creator-stack-panel" className="creator-stack-panel" hidden={!open}>
      <div className="stack-heading"><span>Explore the lobby.</span><QuickSearch/></div>
      <nav className="stack-groups" aria-label="Explore">
        {groups.map(group => <section key={group.title} aria-label={group.title}>
          <h2>{group.title}</h2>
          {group.links.map(link => link.to.startsWith('https:') ? <a key={link.to} href={link.to} target="_blank" rel="noreferrer">
            <strong>{link.label}</strong><small>{link.hint}</small>
          </a> : <NavLink key={link.to} to={link.to}>
            <strong>{link.label}</strong><small>{link.hint}</small>
          </NavLink>)}
        </section>)}
      </nav>
      <div className="stack-settings"><NavLink to="/build-feedback">Feedback</NavLink><div className="header-effects" data-effects-slot /></div>
    </div>
  </div>;
}
