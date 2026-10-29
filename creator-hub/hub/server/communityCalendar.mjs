// INTEGRATION_GAP[COMMUNITY-CALENDAR] (configuration-required): see docs/DEVELOPMENT_GAPS.md#community-calendar.
import {readFileSync} from 'node:fs';
const game = JSON.parse(readFileSync(new URL('../content/game-night.json',import.meta.url),'utf8'));
const show = JSON.parse(readFileSync(new URL('../content/tari-show.json',import.meta.url),'utf8'));

export const COMMUNITY_CALENDAR_URL='https://lobby.tari.com/community/events.ics';
const escapeText=value=>String(value).replaceAll('\\','\\\\').replace(/\r?\n/g,'\\n').replaceAll(',','\\,').replaceAll(';','\\;');
const utc=value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
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
  if(gameNight.enabled && gameNight.game && Number.isFinite(Date.parse(gameNight.startsAt))) events.push({
    id:gameNight.id,title:'Tari Community Game Night',start:gameNight.startsAt,
    location:`${gameNight.channelName} voice · Tari Discord`,url:gameNight.channelUrl,
    description:`Come play, chat, or just watch.\n${gameNight.game}.\nJoin Game Streams and select Join Voice: ${gameNight.channelUrl}\nNew to Tari? ${gameNight.inviteUrl}\nThe end time has not been announced.`
  });
  if(tariShow.enabled && Number.isFinite(Date.parse(tariShow.startsAt)) && Date.parse(tariShow.endsAt)>Date.parse(tariShow.startsAt)) events.push({
    id:tariShow.id,title:'The Tari Show',start:tariShow.startsAt,end:tariShow.endsAt,
    location:`${tariShow.channelName} · Tari Discord`,url:tariShow.inviteUrl,
    description:`Don't ghost the Tari Show. Bring your questions.\nJoin the Stage channel in Tari Discord: ${tariShow.inviteUrl}`
  });
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Tari//Community Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Tari community','NAME:Tari community',`URL:${COMMUNITY_CALENDAR_URL}`];
  for(const event of events) lines.push('BEGIN:VEVENT',`UID:${escapeText(event.id)}@lobby.tari.com`,'DTSTAMP:20261029T220000Z','SEQUENCE:0',`DTSTART:${utc(event.start)}`,...(event.end?[`DTEND:${utc(event.end)}`]:[]),`SUMMARY:${escapeText(event.title)}`,`DESCRIPTION:${escapeText(event.description)}`,`LOCATION:${escapeText(event.location)}`,`URL:${event.url}`,'STATUS:CONFIRMED','TRANSP:TRANSPARENT','BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY',`DESCRIPTION:${escapeText(event.title)}`,'END:VALARM','END:VEVENT');
  return [...lines,'END:VCALENDAR'].map(foldCalendarLine).join('\r\n')+'\r\n';
}
