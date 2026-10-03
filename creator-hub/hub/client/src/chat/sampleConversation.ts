import {useEffect, useRef, useState} from 'react';

/** Presentation-only fictional conversation. Never submitted to the community API. */
export const SAMPLE_CONVERSATION = [
  {at: 0, name: 'PixelMoth', color: '#c7a0ff', body: 'okay this lobby has a vibe ✦'},
  {at: 6, name: 'mintcondition', color: '#68e5ba', body: 'the dark wheel looks so good'},
  {at: 13, name: 'orbitkid', color: '#ffbb75', body: 'one question. i can do one question'},
  {at: 20, name: 'PixelMoth', color: '#c7a0ff', body: 'famous last words 😭'},
  {at: 28, name: 'bitsandbloom', color: '#ff91cc', body: 'anyone working on a new Riff?'},
  {at: 35, name: 'mintcondition', color: '#68e5ba', body: 'trying a night mode for my platformer'},
  {at: 43, name: 'orbitkid', color: '#ffbb75', body: 'oh that could go hard'},
  {at: 51, name: 'bitsandbloom', color: '#ff91cc', body: 'drop it here when it’s ready ↗'},
  {at: 60, name: 'PixelMoth', color: '#c7a0ff', body: 'back to building. gl on your spins ✨'},
] as const;

export function useSampleConversation(active: boolean) {
  const elapsed = useRef(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active || elapsed.current >= 60) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      elapsed.current = Math.min(60, elapsed.current + (now - last) / 1000);
      last = now;
      setSeconds(elapsed.current);
      if (elapsed.current >= 60) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  return SAMPLE_CONVERSATION.filter(message => message.at <= seconds);
}
