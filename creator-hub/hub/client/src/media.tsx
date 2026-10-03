import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Resource } from './api';
import { ResourceCardMedia, StarButton } from './ui';

// One playback implementation across grids, carousels and detail pages.
export function MediaThumb({ r, className, metrics }: { r: Resource; className?: string; metrics?: ReactNode }) {
  return <ResourceCardMedia r={r} className={className} metrics={metrics} />;
}

// A game-store-style tile used inside carousels.
export function MediaCard({ r }: { r: Resource }) {
  return (
    <Link to={`/resource/${encodeURIComponent(r.id)}`} className="mcard">
      <MediaThumb r={r} className="mcard-media" />
      <div className="mcard-body">
        <h3>{r.title}</h3>
        <p className="summary">{r.summary || r.category || 'Open to see source links.'}</p>
        <div className="foot">
          {r.creator?.name && <span className="faint">by {r.creator.name}</span>}
          <StarButton kind="resource" id={r.id} initialStars={r.engagement?.stars ?? 0} />
        </div>
      </div>
    </Link>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(m.matches);
    on();
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

// A smooth, continuously-scrolling "reel". It only animates while the row is
// scrolled into view, pauses on hover, and each stacked row is staggered by
// alternating direction, a slightly different speed and an offset start position —
// so a page of reels feels lively without any jarring snap. Respects
// prefers-reduced-motion (falls back to a manually scrollable row).
export function Reel({ items, renderItem, index = 0, speed = 26 }: {
  items: any[];
  renderItem: (item: any, i: number) => React.ReactNode;
  index?: number;
  speed?: number;
}) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const offset = useRef(0);
  const setWidth = useRef(0);
  const last = useRef(0);
  const inView = useRef(false);
  const hover = useRef(false);
  const raf = useRef(0);
  const reduced = usePrefersReducedMotion();

  const direction: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right';
  // Slight per-row variation so stacked reels stay visually offset.
  const rowSpeed = speed + (index % 3) * 6;

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setWidth.current = t.scrollWidth / 2; // two copies are rendered
    if (offset.current === 0 && setWidth.current) offset.current = (index * 120) % setWidth.current;
  }, [index]);

  useEffect(() => {
    measure();
    const t = track.current;
    if (!t) return;
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    const imgs = Array.from(t.querySelectorAll('img'));
    imgs.forEach((img) => img.addEventListener('load', measure));
    return () => { ro.disconnect(); imgs.forEach((img) => img.removeEventListener('load', measure)); };
  }, [measure]);

  useEffect(() => {
    const io = new IntersectionObserver((es) => { inView.current = es[0]?.isIntersecting ?? false; }, { threshold: 0.12 });
    if (viewport.current) io.observe(viewport.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const step = (ts: number) => {
      const dt = last.current ? Math.min(0.05, (ts - last.current) / 1000) : 0;
      last.current = ts;
      if (inView.current && !hover.current && setWidth.current > 0) {
        offset.current += rowSpeed * dt;
        if (offset.current >= setWidth.current) offset.current -= setWidth.current;
        const base = direction === 'left' ? -offset.current : -(setWidth.current - offset.current);
        if (track.current) track.current.style.transform = `translate3d(${base.toFixed(2)}px,0,0)`;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [direction, rowSpeed, reduced]);

  if (reduced) {
    return (
      <div className="reel reel-static">
        <div className="reel-track">{items.map((it, i) => renderItem(it, i))}</div>
      </div>
    );
  }

  return (
    <div
      className="reel"
      ref={viewport}
      onMouseEnter={() => { hover.current = true; }}
      onMouseLeave={() => { hover.current = false; }}
    >
      <div className="reel-track" ref={track}>
        {items.map((it, i) => renderItem(it, i))}
        {items.map((it, i) => renderItem(it, i + items.length))}
      </div>
    </div>
  );
}
