import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import launch from '../../../content/launch.json';
import SubscribeForm from './SubscribeForm';
import './Journal.css';
export function remainingLaunchTime(now=Date.now()) {
 const total=Math.max(0,Math.floor((Date.parse(launch.target)-now)/1000));
 return {days:Math.floor(total/86400),hours:Math.floor(total/3600)%24,minutes:Math.floor(total/60)%60,seconds:total%60,ended:total===0};
}
function useCountdown(){const [time,setTime]=useState(()=>remainingLaunchTime());useEffect(()=>{const timer=setInterval(()=>setTime(remainingLaunchTime()),1000);return()=>clearInterval(timer);},[]);return time;}
export function LaunchTicket(){
 const time=useCountdown();
 return <Link to="/ootle" className="launch-ticket launch-ticket-live" aria-label="Ootle mainnet launch countdown. November 11 at 11:11 UTC. Join the waitlist">
  <span className="launch-ticket-label"><span className="launch-dot"/><b>OOTLE</b><small>11.11 · 11:11 UTC</small></span>
  {time.ended?<span className="launch-ticket-ended">Launch updates ↗</span>:<span className="launch-ticket-digits" role="timer" aria-live="off" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds until planned launch`}>
   {(['days','hours','minutes','seconds'] as const).map(unit=><span className={`launch-digit launch-digit-${unit}`} key={unit}>
    <span className="launch-digit-window"><b key={time[unit]}>{String(time[unit]).padStart(2,'0')}</b></span><small>{unit==='minutes'?'MIN':unit==='seconds'?'SEC':unit==='hours'?'HRS':'DAYS'}</small>
   </span>)}
  </span>}
  <span className="launch-ticket-join">Join the<br/>waitlist <b>↗</b></span>
 </Link>;
}
export function LaunchFeature(){return <Link to="/ootle" className="launch-feature"><div className="launch-clock-art" aria-hidden="true">11<span>:</span>11</div><div><span className="journal-kicker">NEXT UP · OOTLE MAINNET</span><h2>It’s about to get loud.</h2><p>11/11. 11:11 UTC. You in?</p><p>Planned time. Countdown ≠ network live.</p></div><span className="btn primary">Join the waitlist ↗</span></Link>;}
export default function OotleLaunch(){const time=useCountdown();return <section className="ootle-page"><Link className="more" to="/">← Ootle Lobby</Link><div className="ootle-layout"><div className="ootle-intro"><span className="journal-kicker">OOTLE MAINNET · THE NEXT CHAPTER</span><div className="launch-clock-art" aria-hidden="true">11<span>:</span>11</div><h1>It’s about to<br/>get loud.</h1><p>11/11. 11:11 UTC. You in?</p><p>Join the waitlist for Ootle mainnet news, launch events and what’s next for creators on Tari L2.</p><p><time dateTime={launch.target}>{launch.dateLabel}</time></p>{time.ended?<p>Follow launch updates for the latest status.</p>:<div className="launch-countdown" aria-label="Time until planned launch">{(['days','hours','minutes','seconds'] as const).map(unit=><div key={unit}><b>{String(time[unit]).padStart(2,'0')}</b><small>{unit}</small></div>)}</div>}<small>Planned launch time. This countdown does not indicate network availability.</small></div><SubscribeForm waitlist/></div><Link className="more" to="/blog">See what the builders are cooking. Read the journal →</Link></section>;}
