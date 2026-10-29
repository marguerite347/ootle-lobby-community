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
  const dateLabel = start ? new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric'}).format(start) : '';
  const timeLabel = start ? new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',...(start.getUTCMinutes() ? {minute:'2-digit' as const} : {}),timeZoneName:'short'}).format(start) : '';
  const utcLabel = start ? new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(start) : '';
  return <aside className="game-night-banner" aria-labelledby="game-night-title">
    <div className="game-night-art" aria-hidden="true"><img src="/community/game-night-gamer.webp" alt="" width="512" height="512" decoding="async" /></div>
    <div className="game-night-copy"><div className="game-night-heading"><span className="game-night-kicker">TARI COMMUNITY</span><h2 id="game-night-title">Game <em>night.</em></h2></div>
      <div className="game-night-lineup"><p className="game-night-tagline">Come play, chat, or just watch.</p><p className="game-night-games">{status.scheduled ? event.game : 'Next date and game to be announced.'}</p></div>
    </div>
    <div className="game-night-join">
      <div className="game-night-details">
        {start && <time className="game-night-time" dateTime={event.startsAt!}><span>{dateLabel}</span><strong>{timeLabel} <small>/ {utcLabel}</small></strong></time>}
        <p className="game-night-channel">{event.channelName} voice</p>
      </div>
      <div className="game-night-actions"><a className="btn primary" href={event.inviteUrl} target="_blank" rel="noreferrer">Join us on Discord</a></div>
    </div>
    <button type="button" className="game-night-dismiss" aria-label="Dismiss game night banner" onClick={()=>{setDismissed(true);try{localStorage.setItem(key,'dismissed');}catch{/* Dismiss for this visit when storage is blocked. */}}}><span aria-hidden="true">×</span></button>
  </aside>;
}
