// INTEGRATION_GAP[CFG-SUBSCRIPTIONS] (configuration-required): see docs/DEVELOPMENT_GAPS.md#cfg-subscriptions.
import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect,useState} from 'react';
import TurnstileChallenge from './TurnstileChallenge';

type Configuration = {available:boolean;privacyUrl:string;siteKey:string|null;signupUrl:string|null};
export default function SubscribeForm({showIntro=true}:{showIntro?:boolean}) {
  const [config,setConfig] = useState<Configuration|null>(null);
  const [email,setEmail] = useState(''), [consent,setConsent] = useState(false);
  const [token,setToken] = useState(''), [verificationError,setVerificationError] = useState('');
  const [resetKey,setResetKey] = useState(0);
  const [busy,setBusy] = useState(false), [message,setMessage] = useState(''), [done,setDone] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/subscriptions/config',{signal:controller.signal})
      .then(response => { if (!response.ok) throw Error(); return response.json(); })
      .then(setConfig).catch(() => { if (!controller.signal.aborted) setConfig({available:false,privacyUrl:'',siteKey:null,signupUrl:null}); });
    return () => controller.abort();
  },[]);
  const canonicalSignup = config?.signupUrl && new URL(config.signupUrl).origin !== window.location.origin;
  return <form className="subscribe-form" aria-label="Tari newsletter" onSubmit={async event => {
    event.preventDefault();
    if (!config?.available || !token || !consent || busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/subscriptions',{
        method:'POST',headers:{'Content-Type':'application/json','X-Tari-Newsletter':'1'},
        body:JSON.stringify({email,token,consent,website:''}),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw Error(result.error || 'We couldn’t confirm your signup. Please try again.');
      setMessage(result.message); setDone(true); setEmail('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please try again later.');
      setToken(''); setResetKey(value => value+1);
    } finally { setBusy(false); }
  }}>
    {showIntro && <><h2>Keep me in the loop.</h2>
    <p>Get Tari news, Ootle launch updates and community highlights in your inbox.</p></>}
    {!config ? <p role="status">Checking signup availability…</p> : !config.available ?
      <div className="signup-unavailable" role="status"><p>Email signup is being connected. Follow the latest launch news on the Tari forum.</p><a className="btn primary" href="https://community.tari.com/">Follow Tari updates</a></div> : canonicalSignup ?
      <a className="btn primary" href={safeHref(config.signupUrl!)}>Subscribe on lobby.tari.com</a> : !done ? <>
        <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} onChange={event=>setEmail(event.target.value)}/></label>
        <label className="signup-option"><input type="checkbox" required checked={consent} disabled={busy} onChange={event=>setConsent(event.target.checked)}/><span>I agree to receive Tari email updates. I can unsubscribe at any time. <a href={safeHref(config.privacyUrl)} target="_blank" rel="noreferrer">Privacy notice</a></span></label>
        <TurnstileChallenge siteKey={config.siteKey!} resetKey={resetKey} onToken={setToken} onError={setVerificationError}/>
        {verificationError && <div role="alert"><p>{verificationError}</p><button type="button" className="btn" disabled={busy} onClick={()=>{setVerificationError('');setResetKey(value=>value+1);}}>Retry verification</button></div>}
        <button className="btn primary" disabled={busy||!token||!consent}>{busy?'Subscribing…':'Subscribe'}</button>
      </> : null}
    <p role="status" aria-live="polite">{message}</p>
  </form>;
}
