import {useEffect,useRef,useState} from 'react';
import event from '../../../content/game-night.json';
import show from '../../../content/tari-show.json';

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
export function communityBannerState(now:number) {
  const gameVisible=gameNightStatus(event,now).visible;
  const showVisible=show.enabled && now<Date.parse(show.endsAt);
  return {gameVisible,showVisible,count:Number(gameVisible)+Number(showVisible)};
}
function EventTime({value}:{value:string}) {
  const start=new Date(value);
  const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric'}).format(start);
  const time=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',timeZoneName:'short'}).format(start);
  const utc=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(start);
  return <time className="community-event-time" dateTime={value}><span>{date} · <strong>{time}</strong></span><small>{utc}</small></time>;
}
// INTEGRATION_GAP[COMMUNITY-CALENDAR] (configuration-required): see docs/DEVELOPMENT_GAPS.md#community-calendar.
const calendarUrl='https://lobby.tari.com/community/events.ics';
export default function GameNightBanner() {
  const [now,setNow]=useState(Date.now);
  const key=`tari-community:${gameNightDismissalKey(event)}:${show.id}:${show.startsAt}:${show.endsAt}`;
  const [dismissed,setDismissed]=useState(()=>{try{return localStorage.getItem(key)==='dismissed';}catch{return false;}});
  const calendarDialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
  const {gameVisible,showVisible,count}=communityBannerState(now);
  if(dismissed || !count)return null;
  return <aside className={`community-banner${count===1?' community-banner-single':''}`} aria-label="Tari community events">
    <div className="community-event-pair">
      {gameVisible && <section className="community-event community-game" aria-labelledby="game-night-title">
        <img className="community-mascot turtle" src="/community/game-night-gamer.webp" alt="" width="512" height="512" decoding="async" />
        <div className="community-event-copy"><h2 id="game-night-title">Game <em>night.</em></h2>
          <p className="community-tagline">Come play, chat, or just watch.</p>
          <p className="community-lineup">{event.game}</p>
          <EventTime value={event.startsAt}/><p className="community-channel">{event.channelName} voice</p>
        </div>
      </section>}
      {showVisible && <section className="community-event community-show" aria-labelledby="tari-show-title">
        <img className="community-mascot ghost" src="/community/tari-show-ghost.webp" alt="" width="512" height="512" decoding="async" />
        <div className="community-event-copy"><p className="community-show-kicker">Don’t ghost</p><h2 id="tari-show-title">the <em>Tari Show.</em></h2>
          <p className="community-tagline">Bring your questions.</p>
          <EventTime value={show.startsAt}/><p className="community-channel">{show.channelName} · Discord</p>
        </div>
      </section>}
    </div>
    <div className="community-banner-actions">
      <a className="community-discord" href={event.inviteUrl} target="_blank" rel="noreferrer">Join us on Discord</a>
      <button className="community-calendar-button" type="button" onClick={()=>calendarDialog.current?.showModal()}>{count===2?'Add both to calendar':'Add to calendar'}</button>
    </div>
    <button type="button" className="community-dismiss" aria-label="Dismiss community events banner" onClick={()=>{setDismissed(true);try{localStorage.setItem(key,'dismissed');}catch{/* Dismiss for this visit when storage is blocked. */}}}><span aria-hidden="true">×</span></button>
    <dialog ref={calendarDialog} className="community-calendar-dialog" aria-labelledby="community-calendar-title" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
      <h2 id="community-calendar-title">Save your spot.</h2>
      <p>Game night + The Tari Show</p>
      <div className="community-calendar-options">
        <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarUrl)}`} target="_blank" rel="noreferrer">Google Calendar</a>
        <a href={calendarUrl.replace('https:','webcal:')}>Apple Calendar</a>
        <a href="/community/events.ics" download="tari-community.ics">Download for any calendar</a>
      </div>
      <p className="community-calendar-note">Both events are included. Confirm in your calendar to finish. Google opens in your browser.</p>
      <button className="community-dismiss" type="button" aria-label="Close calendar options" onClick={()=>calendarDialog.current?.close()}><span aria-hidden="true">×</span></button>
    </dialog>
  </aside>;
}
