import {useEffect, useRef} from 'react';

type Crystal = {dispose: () => void};
/** Shared crystal renderer, mounted locally to avoid transparent iframe surface flashes. */
export default function CrystalCanvas({query, onReady, onError}: {
  query: string; onReady?: () => void; onError?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({onReady, onError});
  callbacks.current = {onReady, onError};
  useEffect(() => {
    let disposed = false;
    let scene: Crystal | undefined;
    const moduleUrl = '/crystal-lab/CrystalScene.js';
    import(/* @vite-ignore */ moduleUrl).then(module => {
      if (disposed || !host.current) return;
      scene = module.mountCrystal(host.current, {
        query,
        onReady: () => {if (!disposed) callbacks.current.onReady?.();},
        onError: () => {if (!disposed) callbacks.current.onError?.();},
      });
    }).catch(() => {if (!disposed) callbacks.current.onError?.();});
    return () => {disposed = true; scene?.dispose();};
  }, [query]);
  return <div ref={host} className="crystal-canvas" style={{width: '100%', height: '100%', pointerEvents: 'none'}} aria-hidden="true" />;
}
