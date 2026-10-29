import {useEffect,useState} from 'react';
import event from '../../../content/game-night.json';

export type GameNight = {
  id:string; enabled:boolean; game:string|null; startsAt:string|null; expiresAt:string|null;
  voteClosesAt?:string; announcementUrl?:string; channelName:string; channelUrl:string; inviteUrl:string;
};
export function gameNightStatus(event:GameNight, now=Date.now()) {
  const start = event.startsAt ? Date.parse(event.startsAt) : NaN;
  const end = event.expiresAt ? Date.parse(event.expiresAt) : NaN;
  const scheduled = Boolean(event.game && Number.isFinite(start) && Number.isFinite(end) && end > start);
  return {visible:event.enabled && (!scheduled || now < end), scheduled, voting:Boolean(event.voteClosesAt && now < Date.parse(event.voteClosesAt))};
}
export function gameNightDismissalKey(event:GameNight) {
  // A changed schedule or lineup gets a fresh announcement, even for returning visitors.
  return `tari-game-night:${event.id}:${event.game}:${event.startsAt}:${event.expiresAt}`;
}
export default function GameNightBanner() {
  const [now,setNow] = useState(Date.now);
  const key = gameNightDismissalKey(event);
  const [dismissed,setDismissed] = useState(()=>{try{return localStorage.getItem(key)==='dismissed';}catch{return false;}});
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
  const status = gameNightStatus(event,now);
  if (dismissed || !status.visible) return null;
  const start = status.scheduled ? new Date(event.startsAt!) : null;
  const timeLabel = start ? new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(start) : '';
  const utcLabel = start ? new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(start) : '';
  return <aside className="game-night-banner" aria-labelledby="game-night-title">
    <div className="game-night-art" aria-hidden="true"><img src="/community/game-night-gamer.webp" alt="" width="512" height="512" decoding="async" /></div>
    <div className="game-night-copy"><div className="game-night-heading"><span className="game-night-kicker">COMMUNITY GAME NIGHT</span><h2 id="game-night-title">Pick our next nightmare.</h2></div>
      <div className="game-night-details">
      {start ? <p><strong>{event.game}</strong><span className="game-night-time"><time dateTime={event.startsAt!}>{timeLabel} / {utcLabel}</time></span></p> : <p>Next date and game to be announced.</p>}
      {status.voting && <p>Vote by {new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(event.voteClosesAt!))}.</p>}
      <p className="game-night-channel">Voice channel: <a href={event.channelUrl} target="_blank" rel="noreferrer">{event.channelName}</a></p>
      </div>
    </div>
    <div className="game-night-actions"><a className="btn primary" href={event.announcementUrl || event.channelUrl} target="_blank" rel="noreferrer">{status.voting?'Vote & join the squad':'Game night details'}</a><a className="game-night-invite" href={event.inviteUrl} target="_blank" rel="noreferrer">New here? Join Tari Discord</a></div>
    <button type="button" className="game-night-dismiss" aria-label="Dismiss game night banner" onClick={()=>{setDismissed(true);try{localStorage.setItem(key,'dismissed');}catch{/* Dismiss for this visit when storage is blocked. */}}}><span aria-hidden="true">×</span></button>
  </aside>;
}
