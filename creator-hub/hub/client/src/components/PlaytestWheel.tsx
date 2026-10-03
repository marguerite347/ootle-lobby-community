import {useEffect, useRef, useState} from 'react';
import {sparkCelebration} from './sparkCelebration';
import {crystalCapturePalette} from './crystalCapture';
import type {SparkCue} from './sparkPresentation';
import type {Game} from './DailyTrivia';

/** Presentation bridge. The host owns results; the scene only animates them. */
export default function PlaytestWheel({game, play, onSettled, onCue, warming = false}: {
  warming?: boolean;
  onCue: (cue: SparkCue) => void;
  game: Game; play: (action: string, input?: object) => Promise<Game | null>; onSettled: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const current = useRef({game, play, onSettled, onCue});
  current.current = {game, play, onSettled, onCue};
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState(780);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sendMotion = () => frame.current?.contentWindow?.postMessage({type: 'ootle-wheel-motion', reduced: media.matches || document.documentElement.dataset.hubEffects === 'off'}, location.origin);
    const observer = new MutationObserver(sendMotion);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-hub-effects']});
    media.addEventListener('change', sendMotion);
    let stopCelebration = () => {};
    let pending = false;
    let active = true;
    const readyTimeout = setTimeout(() => setError('The wheel could not load. Use Test again to retry.'), 20000);
    const receive = async (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'ootle-wheel-size' && Number.isFinite(event.data.height)) {setHeight(Math.max(500, Math.min(1400, event.data.height))); return;}
      if (event.data?.type === 'ootle-wheel-ready') {clearTimeout(readyTimeout); setReady(true); setError(''); sendMotion(); return;}
      if (event.data?.type === 'ootle-wheel-unavailable') {clearTimeout(readyTimeout); setError('The wheel could not load. Use Test again to retry.'); return;}
      if (event.data?.type === 'ootle-wheel-audio' && ['clack', 'unlock', 'spin', 'superSpin', 'bank'].includes(event.data.cue)) {current.current.onCue(event.data.cue); return;}
      if (event.data?.type === 'ootle-wheel-settled') { current.current.onSettled(); return; }
      if (event.data?.type === 'ootle-wheel-celebrate') {
        const stage = event.data.stage;
        if (frame.current && stage && [stage.x, stage.y, stage.radius].every(Number.isFinite) && stage.radius > 0 && stage.radius <= 300) {
          stopCelebration(); stopCelebration = sparkCelebration(frame.current, stage, event.data.intense === true);
        }
        return;
      }
      if (event.data?.type !== 'ootle-wheel-request' || pending) return;
      const action = event.data.action;
      if (!['spin', 'super', 'decline'].includes(action)) return;
      pending = true;
      const next = await current.current.play(action, {roundId: current.current.game.round?.id});
      pending = false;
      if (!active) return;
      if (!next) {setError('The wheel could not finish. Use Test again to restart.'); return;}
      frame.current?.contentWindow?.postMessage({type: 'ootle-wheel-result', action, spinIndex: next.round?.spinIndex, superFactor: next.round?.superFactor}, location.origin);
    };
    window.addEventListener('message', receive);
    return () => {clearTimeout(readyTimeout); stopCelebration(); active = false; observer.disconnect(); media.removeEventListener('change', sendMotion); window.removeEventListener('message', receive);};
  }, []);
  return <div className="playtest-wheel" aria-hidden={warming || undefined} style={warming ? {position: 'absolute', width: '100%', visibility: 'hidden', pointerEvents: 'none'} : undefined}>
    {!warming && !ready && !error && <p role="status">Charging your wheel…</p>}
    <iframe ref={frame} aria-hidden={warming || !ready || undefined} style={{height, visibility: ready && !warming ? 'visible' : 'hidden'}} title="AI Sparks multiplier wheels" src={`/wheel-lab/native.html?super&embed${crystalCapturePalette()}&base=${game.round?.base || 100}`} />
    {error && <p role="alert">{error}</p>}
  </div>;
}
