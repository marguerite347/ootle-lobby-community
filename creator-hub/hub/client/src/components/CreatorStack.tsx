import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import QuickSearch from './QuickSearch';

const groups = [
  {title: 'Create', links: [
    {to: '/#creator-toolkit', label: 'Start building', hint: 'Choose a template or guide'},
    {to: '/#creator-community', label: 'Connect & share', hint: 'Meet builders and post your work'},
    {to: '/challenges', label: 'Challenges', hint: 'Join the next challenge'},
  ]},
  {title: 'Resources', links: [
    {to: '/explore', label: 'Discover', hint: 'Find your next resource'},
    {to: '/learn', label: 'Learn', hint: 'Guides to get you going'},
    {to: '/ootle-templates', label: 'Ootle Templates', hint: 'Templates, guides & skills'},
    {to: '/skills', label: 'Skills', hint: 'Equip your agent'},
    {to: '/agent-start', label: 'Build with your agent', hint: 'Guidance for your own tools'},
  ]},
  {title: 'Updates', links: [
    {to: '/calendar', label: 'Marketing calendar', hint: 'See what’s coming up'},
    {to: '/blog', label: 'Creator Journal', hint: 'Ideas and stories'},
    {to: '/growth', label: 'Growth Dashboard', hint: 'Track Ootle growth'},
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="stack-label">Creator<small>Stack</small></span> <span className="stack-chevron" aria-hidden="true">⌄</span>
    </button>
    <div id="creator-stack-panel" className="creator-stack-panel" hidden={!open}>
      <div className="stack-heading"><span>Your next move starts here.</span><QuickSearch/></div>
      <nav className="stack-groups" aria-label="Creator Stack">
        {groups.map(group => <section key={group.title} aria-label={group.title}>
          <h2>{group.title}</h2>
          {group.links.map(link => <NavLink key={link.to} to={link.to}>
            <strong>{link.label}</strong><small>{link.hint}</small>
          </NavLink>)}
        </section>)}
      </nav>
      <div className="stack-settings"><span>Make yourself at home.</span><div className="header-effects" data-effects-slot /></div>
    </div>
  </div>;
}
