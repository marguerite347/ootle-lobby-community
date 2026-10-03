import {useEffect, useState} from 'react';
import './MarketingCalendar.css';

type Item = {id:string; title:string; url:string; due:string|null; start:string|null; complete:boolean; list:string; labels:string[]};
type Calendar = {status:string; message:string|null; lastSyncedAt:string|null; boardUrl:string; timeZone:string; items:Item[]};
const googleCalendarUrl = 'https://calendar.google.com/calendar?cid=Y185MzY5NzIwZWU1YzEyYzBmMTRmN2I1MGI4NzNkMmIzNTJiOTM2YjRjNDczNDljNWY1ODllZTJmZmJlMTZjY2E1QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20';
const boardUrl = 'https://trello.com/b/LrJpBwNN/tari-l2-launch-marketing-calendar';
const easternDay = new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit'});
const dateLabel = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});

export default function MarketingCalendar() {
  const [calendar, setCalendar] = useState<Calendar|null>(null);
  const [error, setError] = useState('');
  const [list, setList] = useState('all');
  const [month, setMonth] = useState(() => easternDay.format(new Date()).slice(0,7));
  useEffect(() => {
    const controller = new AbortController(); let inFlight = false;
    async function load() {
      if(inFlight) return;
      inFlight = true;
      try {
        const response = await fetch('/api/marketing-calendar', {signal:controller.signal, cache:'no-store'});
        if(!response.ok) throw new Error('Calendar unavailable');
        const data:Calendar = await response.json();
        if(!Array.isArray(data.items)) throw new Error('Invalid calendar');
        setCalendar(data); setError('');
      } catch {
        if(!controller.signal.aborted) setError('Calendar connection interrupted. Any entries below are from the last successful load.');
      } finally { inFlight = false; }
    }
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => {controller.abort(); window.clearInterval(timer);};
  }, []);
  const items = (calendar?.items || []).filter(item => item.due || item.start);
  const lists = [...new Set(items.map(item => item.list))].sort();
  const filtered = items.filter(item => list === 'all' || item.list === list);
  const today = easternDay.format(new Date());
  const [year, monthNumber] = month.split('-').map(Number);
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const cellCount = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const monthLabel = new Intl.DateTimeFormat('en-US', {month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  function changeMonth(offset:number) {
    const next = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
    setMonth(`${next.getUTCFullYear()}-${String(next.getUTCMonth()+1).padStart(2,'0')}`);
  }
  function card(item:Item) {
    const date = (item.due || item.start)!;
    return <a className="marketing-card" key={item.id} href={item.url} target="_blank" rel="noreferrer">
      <time dateTime={date}>{new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(new Date(date))} ET{item.due ? ' · Due' : ' · Starts'}</time>
      <span>{item.title}</span>{item.complete && <small>Complete</small>}
    </a>;
  }
  return <section className="marketing-calendar">
    <header className="marketing-heading"><div><span className="eyebrow">Ootle marketing</span><h1>Make the next move.</h1><p>The launch calendar, straight from Trello. Update a card there and it appears here.</p></div><a className="btn primary" href={boardUrl} target="_blank" rel="noreferrer">Open Trello ↗</a></header>
    <div className="marketing-sync" role="status">
      {error || calendar?.message || (calendar ? 'Connected to Trello. Checks for changes every minute while this page is open.' : 'Connecting to the calendar…')}
      {calendar?.lastSyncedAt && <small>Last successful sync: {dateLabel.format(new Date(calendar.lastSyncedAt))} ET</small>}
    </div>
    {calendar?.status==='not-connected' && <p><a href="/calendar/draft/">View the saved calendar draft ↗</a> · This earlier CSV plan is not synced with Trello.</p>}
    <div className="marketing-toolbar">
      <div className="marketing-month-nav"><button aria-label="Previous month" onClick={()=>changeMonth(-1)}>←</button><h2 aria-live="polite">{monthLabel}</h2><button aria-label="Next month" onClick={()=>changeMonth(1)}>→</button><button onClick={()=>setMonth(today.slice(0,7))}>Today</button></div>
      <label>Board list<select value={list} onChange={event=>setList(event.target.value)}><option value="all">All scheduled cards</option>{lists.map(value=><option key={value}>{value}</option>)}</select></label>
      <a className="btn" href={googleCalendarUrl} target="_blank" rel="noreferrer">Subscribe in Google Calendar ↗</a>
    </div>
    <p className="marketing-date-note">Tari Google account or calendar access required. Google event syncing is awaiting connector access; use this Trello calendar for the current schedule.</p>
    <p className="marketing-date-note">Eastern Time · Only cards with a Trello due or start date appear. Open a card to update it in Trello.</p>
    <div className="marketing-grid-scroll" tabIndex={0} aria-label="Monthly calendar. Scroll horizontally on small screens.">
      <table className="marketing-month"><caption>{monthLabel} marketing calendar</caption><thead><tr>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><th scope="col" key={day}>{day}</th>)}</tr></thead>
        <tbody>{Array.from({length:cellCount/7},(_,week)=><tr key={week}>{Array.from({length:7},(_,weekday)=>{
          const day = week*7+weekday-firstDay+1;
          if(day<1 || day>daysInMonth) return <td key={weekday} className="marketing-day-empty"/>;
          const dayKey = `${month}-${String(day).padStart(2,'0')}`;
          const entries = filtered.filter(item=>easternDay.format(new Date((item.due || item.start)!))===dayKey);
          return <td key={weekday} className={dayKey===today?'marketing-today':''}><time className="marketing-day-number" dateTime={dayKey} aria-current={dayKey===today?'date':undefined}>{day}</time>{entries.map(card)}</td>;
        })}</tr>)}</tbody>
      </table>
    </div>
    {calendar?.status==='connected' && !items.length && <p>No dated cards yet. Add a due or start date in Trello to place a card on this calendar.</p>}

  </section>;
}
