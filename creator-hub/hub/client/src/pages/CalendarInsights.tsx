// INTEGRATION_GAP[COMMUNITY-CALENDAR-METRICS]: owner-only estimates; never a verified people count.
import {useCallback,useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import './SubmitProject.css';
import './CalendarInsights.css';
type Counts={clicks:number;download_requests:number;observed_feed_links:number;estimated_active_subscriptions:number};
type Report={trackingStartedAt:string;generatedAt:string;totals:Counts;providers:(Counts&{provider:string})[];limitations:string[]};
export default function CalendarInsights(){
  const [data,setData]=useState<Report|null>(null),[message,setMessage]=useState('Loading calendar activity…'),[busy,setBusy]=useState(false);
  const load=useCallback(async()=>{setBusy(true);try {
    const response=await fetch('/api/chat/calendar-metrics',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(response.status===403)throw Error('Sign in with your existing owner account in chat, then refresh this report.');
    if(!response.ok)throw Error('Calendar activity is unavailable. Try again shortly.');
    setData(await response.json());setMessage('');
  } catch(error){setData(null);setMessage(error instanceof Error?error.message:'Calendar activity is unavailable.');}finally{setBusy(false);}},[]);
  useEffect(()=>{void load();},[load]);
  const metrics=[['clicks','Calendar choices','Last 30 days'],['download_requests','Download requests','Last 30 days'],['observed_feed_links','Observed feed links','Last 14 days'],['estimated_active_subscriptions','Estimated active subscriptions','Repeat fetches · last 14 days']] as const;
  return <main className="project-submit-page calendar-insights"><Link to="/">Back to the Lobby</Link><h1>Calendar <em>activity.</em></h1>
    <p>Private owner report. These are link and request counts, not a verified count of people.</p>
    <button className="season-button" onClick={()=>void load()} disabled={busy}>{busy?'Refreshing…':'Refresh report'}</button>
    {message&&<p role="status">{message}</p>}
    {data&&<><p>Tracking since {new Date(data.trackingStartedAt).toLocaleString()}. Earlier subscriptions are not included.</p>
      <div className="calendar-metric-grid">{metrics.map(([key,label,note])=><section key={key}><h2>{label}</h2><strong>{data.totals[key].toLocaleString()}</strong><p>{note}</p></section>)}</div>
      <div className="calendar-metric-table"><table><caption>By calendar choice</caption><thead><tr><th>Calendar</th><th>Choices</th><th>Downloads</th><th>Observed links</th><th>Estimated active</th></tr></thead>
        <tbody>{data.providers.map(row=><tr key={row.provider}><th>{row.provider==='google'?'Google':row.provider==='apple'?'Apple':'Download'}</th>{metrics.map(([key])=><td key={key}>{row[key]}</td>)}</tr>)}</tbody></table></div>
      <details><summary>How these numbers are counted</summary><ul>{data.limitations.map(note=><li key={note}>{note}</li>)}</ul><p>“Choices” counts recorded clicks on Google, Apple, or download. “Observed links” have been fetched at least once. Active estimates require another fetch at least six hours after the first.</p></details>
      <p>Updated {new Date(data.generatedAt).toLocaleString()}.</p></>}
  </main>;
}
