// INTEGRATION_GAP[COMMUNITY-CALENDAR] (configuration-required): see docs/DEVELOPMENT_GAPS.md#community-calendar.
import {readFileSync} from 'node:fs';
const game = JSON.parse(readFileSync(new URL('../content/game-night.json',import.meta.url),'utf8'));
const show = JSON.parse(readFileSync(new URL('../content/tari-show.json',import.meta.url),'utf8'));

export const COMMUNITY_CALENDAR_URL='https://lobby.tari.com/community/events.ics';
const escapeText=value=>String(value).replaceAll('\\','\\\\').replace(/\r?\n/g,'\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const utc=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const newYorkLocal=value=>{
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(({type,value})=>[type,value]));
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
};
// US Eastern rules since 2007. A local DTSTART keeps weekly events at 6 PM
// through DST; a UTC DTSTART would shift the local hour each spring/fall.
const easternZone=[
  'BEGIN:VTIMEZONE','TZID:America/New_York',
  'BEGIN:DAYLIGHT','DTSTART:20070311T020000','TZOFFSETFROM:-0500','TZOFFSETTO:-0400','TZNAME:EDT','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','END:DAYLIGHT',
  'BEGIN:STANDARD','DTSTART:20071104T020000','TZOFFSETFROM:-0400','TZOFFSETTO:-0500','TZNAME:EST','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','END:STANDARD',
  'END:VTIMEZONE'
];
// RFC 5545 content lines are at most 75 octets; never split a UTF-8 character.
export function foldCalendarLine(value) {
  let line='',bytes=0;const lines=[];
  for(const char of value) {
    const length=Buffer.byteLength(char);
    if(bytes+length>75){lines.push(line);line=' ';bytes=1;}
    line+=char;bytes+=length;
  }
  return [...lines,line].join('\r\n');
}
export function communityCalendar(gameNight=game,tariShow=show) {
  const events=[];
  const recurring=gameNight.recurrence?.frequency==='weekly' && gameNight.recurrence.timeZone==='America/New_York';
  if(gameNight.enabled && (gameNight.game || recurring) && Number.isFinite(Date.parse(gameNight.startsAt))) events.push({
    id:gameNight.id,updatedAt:gameNight.calendarUpdatedAt,sequence:gameNight.calendarSequence,title:'Tari Community Game Night',start:gameNight.startsAt,
    recurring,
    location:`${gameNight.channelName} voice · Tari Discord`,url:gameNight.channelUrl,
    description:`Come play, chat, or just watch.${gameNight.game?`\n${gameNight.game}.`:''}\nJoin ${gameNight.channelName} and select Join Voice: ${gameNight.channelUrl}\nNew to Tari? ${gameNight.inviteUrl}\nThe end time has not been announced.`
  });
  if(tariShow.enabled && Number.isFinite(Date.parse(tariShow.startsAt)) && Date.parse(tariShow.endsAt)>Date.parse(tariShow.startsAt)) events.push({
    id:tariShow.id,updatedAt:tariShow.calendarUpdatedAt,sequence:tariShow.calendarSequence,title:'The Tari Show',start:tariShow.startsAt,end:tariShow.endTimeConfirmed===false?undefined:tariShow.endsAt,
    location:`${tariShow.channelName} · Tari Discord`,url:tariShow.inviteUrl,
    description:`Don't ghost the Tari Show. Bring your questions.\nJoin the Stage channel in Tari Discord: ${tariShow.inviteUrl}${tariShow.endTimeConfirmed===false?"\nThe end time has not been announced.":""}`
  });
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tari//Community Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Tari community','NAME:Tari community',`URL:${COMMUNITY_CALENDAR_URL}`];
  if(events.some(event=>event.recurring))lines.push(...easternZone);
  for(const event of events) lines.push(
    'BEGIN:VEVENT',`UID:${escapeText(event.id)}@lobby.tari.com`,
    `DTSTAMP:${utc(event.updatedAt||'2026-10-29T22:00:00Z')}`,
    `SEQUENCE:${Number.isSafeInteger(event.sequence)&&event.sequence>=0?event.sequence:0}`,
    ...(event.recurring?[`DTSTART;TZID=America/New_York:${newYorkLocal(event.start)}`,'RRULE:FREQ=WEEKLY']: [`DTSTART:${utc(event.start)}`]),
    ...(event.end?[`DTEND:${utc(event.end)}`]:[]),
    `SUMMARY:${escapeText(event.title)}`,`DESCRIPTION:${escapeText(event.description)}`,`LOCATION:${escapeText(event.location)}`,`URL:${event.url}`,
    'STATUS:CONFIRMED','TRANSP:TRANSPARENT','BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY',`DESCRIPTION:${escapeText(event.title)}`,'END:VALARM','END:VEVENT'
  );
  return [...lines,'END:VCALENDAR'].map(foldCalendarLine).join('\r\n')+'\r\n';
}
