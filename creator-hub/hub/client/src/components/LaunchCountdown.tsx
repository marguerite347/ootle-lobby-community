import {useEffect,useState} from 'react';
import {launchDateLabel,pollLaunchTarget,remainingLaunchTime} from './launchClock';
import status from '../../../../../content/network-status.json';
import './Journal.css';

const confirmed=status.entries.find(entry=>['mainnet','both'].includes(entry.state)&&entry.deploymentEvidence)?.deploymentEvidence;

export default function LaunchCountdown(){
 const [target,setTarget]=useState<number|null>(null);
 const [now,setNow]=useState(Date.now);
 useEffect(()=>{
  if(confirmed)return;
  const poller=pollLaunchTarget(setTarget);
  const resume=()=>{if(!document.hidden){setNow(Date.now());void poller.refresh();}};
  document.addEventListener('visibilitychange',resume);
  const tick=setInterval(()=>setNow(Date.now()),1000);
  return()=>{poller.stop();clearInterval(tick);document.removeEventListener('visibilitychange',resume);};
 },[]);
 if(confirmed)return <a className="launch-ticket launch-ticket-live" href="#mainnet" aria-label="Ootle mainnet is live. Explore confirmed apps.">
  <span className="launch-ticket-label"><span className="launch-dot"/><b>OOTLE</b><small>Confirmed on-chain</small></span>
  <span className="launch-soon">Mainnet live</span>
 </a>;
 if(target===null)return null;
 const time=remainingLaunchTime(target,now),date=launchDateLabel(target);
 return <div className="launch-ticket launch-ticket-live" role="group" aria-label={`Ootle mainnet planned launch. ${date}.`}>
  <span className="launch-ticket-label"><span className="launch-dot"/><b>OOTLE</b><small>{date}</small></span>
  {time.ended ? <span className="launch-soon">Launching soon</span> :
  <span className="launch-ticket-digits" role="timer" aria-live="off" aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds until planned launch`}>
   {(['days','hours','minutes','seconds'] as const).map(unit=><span className={`launch-digit launch-digit-${unit}`} key={unit}><span className="launch-digit-window"><b key={time[unit]}>{String(time[unit]).padStart(2,'0')}</b></span><small>{unit==='minutes'?'MIN':unit==='seconds'?'SEC':unit==='hours'?'HRS':'DAYS'}</small></span>)}
  </span>}
 </div>;
}
