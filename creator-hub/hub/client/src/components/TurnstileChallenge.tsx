// INTEGRATION_GAP[CFG-SUBSCRIPTIONS] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-subscriptions.
import {useEffect, useRef, useState} from 'react';

type Turnstile = {
  render: (container:HTMLElement, options:Record<string,unknown>) => string;
  remove: (id:string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }
let loading:Promise<Turnstile>|null = null;

function loadTurnstile():Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<Turnstile>((resolve,reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); reject(Error('Verification could not load. Please retry.')); };
    const timer = window.setTimeout(fail,15000);
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onerror = fail;
    script.onload = () => { clearTimeout(timer); if (window.turnstile) resolve(window.turnstile); else fail(); };
    document.head.appendChild(script);
  }).catch(error => { loading = null; throw error; });
  return loading;
}

export default function TurnstileChallenge({siteKey,resetKey,onToken,onError}:{
  siteKey:string;resetKey:number;onToken:(token:string)=>void;onError:(message:string)=>void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [size,setSize] = useState<'compact'|'flexible'|null>(null);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setSize(entry.contentRect.width < 300 ? 'compact' : 'flexible'));
    observer.observe(container.current);
    return () => observer.disconnect();
  },[]);
  useEffect(() => {
    if (!size) return;
    let active = true, widget:string|undefined, api:Turnstile|undefined;
    onToken('');
    loadTurnstile().then(turnstile => {
      if (!active || !container.current) return;
      api = turnstile;
      widget = api.render(container.current, {
        sitekey:siteKey, theme:'dark', size,
        callback:(token:string) => { if (active) { onToken(token); onError(''); } },
        'expired-callback':() => { if (active) onToken(''); },
        'error-callback':() => { if (active) { onToken(''); onError('Verification failed. Please retry.'); } return true; },
        'timeout-callback':() => { if (active) { onToken(''); onError('Verification timed out. Please retry.'); } },
      });
    }).catch(() => { if (active) onError('Verification could not load. Please retry.'); });
    return () => { active = false; if (widget !== undefined) api?.remove(widget); };
  },[siteKey,resetKey,onToken,onError,size]);
  return <div ref={container} aria-label="Email signup verification" style={{minHeight:65,maxWidth:'100%'}}/>;
}
