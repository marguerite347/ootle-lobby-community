import CrystalCanvas from './CrystalCanvas';
import {crystalCapturePalette} from './crystalCapture';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import './SparkUnlock.css';
export default function SparkUnlock({amount, headline, onContinue, onReveal, inline = false}: {
  inline?: boolean; amount: number; balance: number; headline: string; onContinue: () => void; onReveal: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const advance = useRef(onContinue);
  advance.current = onContinue;
  const revealCue = useRef(onReveal);
  revealCue.current = onReveal;
  const button = useRef<HTMLButtonElement>(null);
  const [crystalState, setCrystalState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.hubEffects === 'off';
  useEffect(() => {
    if (inline) return;
    const previous = document.activeElement as HTMLElement | null;
    button.current?.focus({preventScroll: true});
    const app = document.getElementById('root');
    const wasInert = app?.inert ?? false;
    if (app) app.inert = true;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { if (app) app.inert = wasInert; document.body.style.overflow = overflow; previous?.focus({preventScroll: true}); };
  }, []);
  useEffect(() => {
    if (reduced) return;
    const timeout = setTimeout(() => setCrystalState(state => state === 'loading' ? 'unavailable' : state), 8000);
    return () => clearTimeout(timeout);
  }, [reduced]);
  const loading = !reduced && crystalState === 'loading';
  useEffect(() => {
    if (loading) return;
    const start = performance.now();
    const timer = setInterval(() => setElapsed(performance.now() - start), 40);
    const soundTimer = setTimeout(() => revealCue.current(), reduced ? 0 : 1350);
    return () => {clearInterval(timer); clearTimeout(soundTimer);};
  }, [loading, reduced]);
  useEffect(() => {
    if (!inline || loading) return;
    const timeout = setTimeout(() => advance.current(), reduced ? 1800 : 4800);
    return () => clearTimeout(timeout);
  }, [inline, loading, reduced]);
  const progress = reduced ? 1 : Math.min(1, Math.max(0, (elapsed - 1350) / 1250));
  const count = Math.round(amount * (1 - Math.pow(1 - progress, 3)));
  const content = <div className={`spark-unlock${inline ? ' spark-unlock-inline' : ''}`} data-loading={loading || undefined} data-still={reduced || undefined} role={inline ? 'region' : 'dialog'} aria-modal={inline ? undefined : true} aria-label={`${headline} ${amount} AI Sparks banked`} onKeyDown={event => {
    if (event.key === 'Escape') onContinue();
    if (!inline && event.key === 'Tab') { event.preventDefault(); button.current?.focus(); }
  }}>
    <div className="reward-rays" aria-hidden="true" />
    <div className="unlock-stage">

      <div className="unlock-object unlock-object-live" aria-hidden="true">{!reduced && crystalState !== 'unavailable' && <CrystalCanvas query={`reward=1&wheel=1${crystalCapturePalette()}`} onReady={() => setCrystalState('ready')} onError={() => setCrystalState('unavailable')} />}</div>

      <div className="unlock-payoff"><h2>{headline}</h2><div className="unlock-amount" aria-hidden="true">+{count.toLocaleString()}</div><p>AI Sparks banked</p></div>
      <div className="unlock-next">{inline ? <p role="status">Next up: spin.</p> : <button ref={button} className="btn" onClick={onContinue}>Spin for the multiplier <span>→</span></button>}</div>
    </div>
  </div>;
  return inline ? content : createPortal(content, document.body);
}
