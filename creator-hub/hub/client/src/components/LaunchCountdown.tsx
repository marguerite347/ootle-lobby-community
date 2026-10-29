import {useEffect,useState} from 'react';
import launch from '../../../content/launch.json';
import './Journal.css';
export function remainingLaunchTime(now=Date.now()) {
 const total=Math.max(0,Math.floor((Date.parse(launch.target)-now)/1000));
 return {days:Math.floor(total/86400),hours:Math.floor(total/3600)%24,minutes:Math.floor(total/60)%60,seconds:total%60,ended:total===0};
}
function useCountdown(){const [time,setTime]=useState(()=>remainingLaunchTime());useEffect(()=>{const timer=setInterval(()=>setTime(remainingLaunchTime()),1000);return()=>clearInterval(timer);},[]);return time;}
export default function LaunchCountdown(){
 const time=useCountdown();
 if (time.ended) return null;
 return <div className="launch-ticket launch-ticket-live" role="group" aria-label="Ootle mainnet planned launch. November 11 at 11:11 UTC.">
  <span className="launch-ticket-label"><span className="launch-dot"/><b>OOTLE</b><small>11.11 · 11:11 UTC</small></span>
  <span className="launch-ticket-digits" role="timer" aria-live="off" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds until planned launch`}>
   {(['days','hours','minutes','seconds'] as const).map(unit=><span className={`launch-digit launch-digit-${unit}`} key={unit}>
    <span className="launch-digit-window"><b key={time[unit]}>{String(time[unit]).padStart(2,'0')}</b></span><small>{unit==='minutes'?'MIN':unit==='seconds'?'SEC':unit==='hours'?'HRS':'DAYS'}</small>
   </span>)}
  </span>
 </div>;
}
