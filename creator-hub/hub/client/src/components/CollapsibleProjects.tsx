import {useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import './CollapsibleProjects.css';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Keep the first actual grid row, including when feeds or breakpoints change. */
export default function CollapsibleProjects({children, label}: {children: ReactNode; label: string}) {
  const id = useId();
  const content = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [layout, setLayout] = useState({total: 0, firstRow: 0, closed: 0, open: 0});

  useBrowserLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      // Layout offsets ignore the card hover transform, unlike visual rectangles.
      const top = (node: HTMLElement) => {
        let value = node.offsetTop;
        let parent = node.offsetParent as HTMLElement | null;
        while (parent && parent !== element) {value += parent.offsetTop; parent = parent.offsetParent as HTMLElement | null;}
        return value;
      };
      const cards = [...element.querySelectorAll<HTMLElement>('.grid > article, .mystery-grid > article')];
      const firstTop = cards[0] ? top(cards[0]) : 0;
      const row = cards.filter(card => Math.abs(top(card) - firstTop) < 2);
      const closed = row.length ? Math.max(...row.map(card => top(card) + card.offsetHeight)) : 0;
      const next = {total: cards.length, firstRow: row.length, closed, open: element.offsetHeight};
      cards.forEach(card => {
        const hidden = !expanded && !row.includes(card);
        if (hidden && !card.inert) card.querySelectorAll('video').forEach(video => video.pause());
        card.inert = hidden;
        if (hidden) card.setAttribute('aria-hidden', 'true');
        else card.removeAttribute('aria-hidden');
      });
      element.querySelectorAll<HTMLElement>('.mystery-invitation, .submission-check, [role="status"]').forEach(note => {
        const hidden = cards.length > row.length && !expanded && top(note) >= closed;
        note.inert = hidden;
        if (hidden) note.setAttribute('aria-hidden', 'true');
        else note.removeAttribute('aria-hidden');
      });
      setLayout(previous => Object.keys(next).every(key => next[key as keyof typeof next] === previous[key as keyof typeof next]) ? previous : next);
    };
    const schedule = () => {cancelAnimationFrame(frame); frame = requestAnimationFrame(measure);};
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(element);
    const changes = new MutationObserver(schedule);
    changes.observe(element, {childList: true, subtree: true, characterData: true});
    return () => {resize.disconnect(); changes.disconnect(); cancelAnimationFrame(frame);};
  }, [children, expanded]);

  const hasMore = layout.total > layout.firstRow;
  const toggle = () => {
    // A bottom-of-list collapse should return to this category, not skip ahead.
    if (expanded && viewport.current && viewport.current.getBoundingClientRect().top < 0) {
      const heading = viewport.current.closest('section')?.querySelector('.section-head') || viewport.current;
      const header = document.querySelector('.site-header');
      const offset = header && ['sticky', 'fixed'].includes(getComputedStyle(header).position) ? header.getBoundingClientRect().height : 0;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.hubEffects === 'off';
      window.scrollTo({top: window.scrollY + heading.getBoundingClientRect().top - offset - 16, behavior: reduceMotion ? 'auto' : 'smooth'});
    }
    setExpanded(value => !value);
  };
  return <div className="project-collapse">
    <div id={id} ref={viewport} className="project-collapse-viewport" style={{height: hasMore ? (expanded ? layout.open : layout.closed) : undefined}}>
      <div ref={content} className="project-collapse-content">{children}</div>
    </div>
    {hasMore && <div className="project-collapse-controls">
      <span>{expanded ? `Showing all ${layout.total}` : `${layout.firstRow} of ${layout.total}`}</span>
      <button type="button" aria-expanded={expanded} aria-controls={id} aria-label={`${expanded ? 'Show less' : `Show all ${layout.total}`} · ${label}`} onClick={toggle}>{expanded ? 'Show less' : `Show all ${layout.total}`}</button>
    </div>}
  </div>;
}
