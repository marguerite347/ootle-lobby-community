import {useEffect,useRef,useState} from 'react';
import event from '../../../content/game-night.json';
import show from '../../../content/tari-show.json';
import {prepareCalendarOptions,recordCalendarChoice,sharedCalendarOptions} from '../calendarTracking';

export type GameNight = {
  id:string; enabled:boolean; game:string|null; startsAt:string|null; expiresAt:string|null;
  voteClosesAt?:string; announcementUrl?:string; channelName:string; channelUrl:string; inviteUrl:string;
  recurrence?:{frequency:string;timeZone:string};
};
type WeeklySchedule = {startsAt?:string|null;recurrence?:{frequency:string;timeZone:string}};
type TariShow = WeeklySchedule & {enabled:boolean;endsAt:string};
export function weeklyEvent(event:WeeklySchedule) {
  return event.recurrence?.frequency==='weekly' && event.recurrence.timeZone==='America/New_York' && Boolean(event.startsAt && Number.isFinite(Date.parse(event.startsAt)));
}
export function gameNightStatus(event:GameNight, now=Date.now()) {
  const start = event.startsAt ? Date.parse(event.startsAt) : NaN;
  const end = event.expiresAt ? Date.parse(event.expiresAt) : NaN;
  const recurring = weeklyEvent(event);
  const scheduled = recurring || Boolean(event.game && Number.isFinite(start) && Number.isFinite(end) && end > start);
  return {visible:event.enabled && (recurring || !scheduled || now < end), scheduled, voting:Boolean(!recurring && event.voteClosesAt && now < Date.parse(event.voteClosesAt))};
}
export function gameNightDismissalKey(event:GameNight) {
  // A changed schedule or lineup gets a fresh announcement, even for returning visitors.
  return `tari-game-night:${event.id}:${event.game}:${event.startsAt}:${event.expiresAt}:${event.recurrence?.frequency||''}:${event.recurrence?.timeZone||''}`;
}
export function communityBannerState(now:number,gameEvent:GameNight=event,showEvent:TariShow=show) {
  const gameVisible=gameNightStatus(gameEvent,now).visible;
  const showVisible=showEvent.enabled && (weeklyEvent(showEvent) || now<Date.parse(showEvent.endsAt));
  return {gameVisible,showVisible,count:Number(gameVisible)+Number(showVisible)};
}
export function communityDismissalKey(gameEvent:GameNight,showEvent:TariShow & {id:string}) {
  return `tari-community:${gameNightDismissalKey(gameEvent)}:${showEvent.id}:${showEvent.startsAt}:${showEvent.endsAt}:${showEvent.recurrence?.frequency||''}:${showEvent.recurrence?.timeZone||''}`;
}
function EventTime({value}:{value:string}) {
  const start=new Date(value);
  const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',month:'short',day:'numeric'}).format(start);
  const time=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',timeZoneName:'short'}).format(start);
  const utc=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(start);
  return <time className="community-event-time" dateTime={value}><span>{date} · <strong>{time}</strong></span><small>{utc}</small></time>;
}
export function weeklyEventTime(value:string) {
  const start=new Date(value);
  const day=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long'}).format(start);
  const time=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:start.getUTCMinutes()?'2-digit':undefined}).format(start);
  return {day,time};
}
function WeeklyTime({value}:{value:string}) {
  const {day,time}=weeklyEventTime(value);
  return <p className="community-event-time"><span>Every {day} · <strong>{time} ET</strong></span></p>;
}
// INTEGRATION_GAP[COMMUNITY-CALENDAR] (configuration-required): see docs/DEVELOPMENT_GAPS.md#community-calendar.
export default function GameNightBanner() {
  const [now,setNow]=useState(Date.now);
  const key=communityDismissalKey(event,show);
  const [dismissed,setDismissed]=useState(()=>{try{return localStorage.getItem(key)==='dismissed';}catch{return false;}});
  const calendarDialog=useRef<HTMLDialogElement>(null);
  const [calendarOptions,setCalendarOptions]=useState(sharedCalendarOptions);
  const [calendarLoading,setCalendarLoading]=useState(false);
  function openCalendar() {
    calendarDialog.current?.showModal();setCalendarLoading(true);
    void prepareCalendarOptions().then(setCalendarOptions).finally(()=>setCalendarLoading(false));
  }
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
  const {gameVisible,showVisible,count}=communityBannerState(now);
  const recurring=weeklyEvent(event);
  if(dismissed || !count)return null;
  return <aside className={`community-banner${count===1?' community-banner-single':''}`} aria-label="Tari community events">
    <div className="community-event-pair">
      {gameVisible && <section className={`community-event community-game${recurring?' community-game-regular':''}`} aria-labelledby="game-night-title">
        <img className="community-scene community-game-scene" src={recurring?'/community/game-night-gamer.webp':'/community/game-night-horror-scene.webp'} alt="" width="800" height="800" decoding="async" />
        <div className="community-event-copy"><h2 id="game-night-title">Game <em>night.</em></h2>
          <p className="community-tagline">Come play, chat, or just watch.</p>
          {event.game && <p className="community-lineup">{event.game}</p>}
          {recurring?<WeeklyTime value={event.startsAt}/>:<EventTime value={event.startsAt}/>}<p className="community-channel">{event.channelName} voice</p>
        </div>
      </section>}
      {showVisible && <section className="community-event community-show" aria-labelledby="tari-show-title">
        <img className="community-scene community-show-scene" src="/community/tari-show-campaign-scene.webp" alt="" width="800" height="800" decoding="async" />
        <div className="community-event-copy"><h2 id="tari-show-title"><span className="community-show-kicker">Don’t ghost</span><em>the Tari Show.</em></h2>
          <p className="community-tagline">Bring your questions.</p>
          {weeklyEvent(show)?<WeeklyTime value={show.startsAt}/>:<EventTime value={show.startsAt}/>}<p className="community-channel">{show.channelName} · Discord</p>
        </div>
      </section>}
    </div>
    <div className="community-banner-actions">
      <a className="community-discord" href={event.inviteUrl} target="_blank" rel="noreferrer">Join us on Discord</a>
      <button className="community-calendar-button" type="button" onClick={openCalendar}>Add to calendar</button>
    </div>
    <button type="button" className="community-dismiss" aria-label="Dismiss community events banner" onClick={()=>{setDismissed(true);try{localStorage.setItem(key,'dismissed');}catch{/* Dismiss for this visit when storage is blocked. */}}}><span aria-hidden="true">×</span></button>
    <dialog ref={calendarDialog} className="community-calendar-dialog" aria-labelledby="community-calendar-title" onClick={e=>{if(e.target===e.currentTarget)e.currentTarget.close();}}>
      <h2 id="community-calendar-title">Save your spot.</h2>
      <p>Game night + The Tari Show</p>
      <div className="community-calendar-options">
        {calendarLoading?<p role="status">Opening calendar options…</p>:<>
          <a href={calendarOptions.google.href} onClick={()=>recordCalendarChoice('google',calendarOptions.google)} target="_blank" rel="noreferrer">Google Calendar</a>
          <a href={calendarOptions.apple.href} onClick={()=>recordCalendarChoice('apple',calendarOptions.apple)}>Apple Calendar</a>
          <a href={calendarOptions.download.href} onClick={()=>recordCalendarChoice('download',calendarOptions.download)} download="tari-community.ics">Download for any calendar</a>
        </>}
      </div>
      <p className="community-calendar-note">Subscribe with Google or Apple for schedule updates. Downloads are a one-time copy.</p>
      <p className="community-calendar-note">Random feed links help us measure calendar use. We can’t access your calendar.</p>
      <button className="community-dismiss" type="button" aria-label="Close calendar options" onClick={()=>calendarDialog.current?.close()}><span aria-hidden="true">×</span></button>
    </dialog>
  </aside>;
}
