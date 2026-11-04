import test from 'node:test';
import assert from 'node:assert/strict';
import {communityCalendar,foldCalendarLine} from '../creator-hub/hub/server/communityCalendar.mjs';
import {createInspirationLobby} from '../creator-hub/hub/server/inspirationLobby.mjs';
const gameFixture={id:'2026-11-01-horror-night',enabled:true,game:'R.E.P.O. or Shift At Midnight',startsAt:'2026-11-01T18:00:00-05:00',channelName:'Game Streams',channelUrl:'https://discord.com/channels/892738558316662855/1558828371100573726',inviteUrl:'https://discord.gg/tari',calendarUpdatedAt:'2026-10-29T22:00:00Z',calendarSequence:0};
const showFixture={id:'2026-11-03-tari-show',enabled:true,startsAt:'2026-11-03T13:00:00-05:00',endsAt:'2026-11-03T14:00:00-05:00',channelName:'Stage',inviteUrl:'https://discord.gg/tari',calendarUpdatedAt:'2026-10-29T22:00:00Z',calendarSequence:0};
const unfold=value=>value.replace(/\r\n[ \t]/g,'');
test('one calendar includes both confirmed starts after the DST change, with stable distinct IDs',()=>{
  const raw=communityCalendar(gameFixture,showFixture);
  const events=unfold(raw).split('BEGIN:VEVENT\r\n').slice(1);
  assert.equal(events.length,2);
  assert.match(events[0],/DTSTART:20261101T230000Z\r\n/);
  assert.match(events[0],/SUMMARY:Tari Community Game Night/);
  assert.match(events[0],/Game Streams/);
  assert.doesNotMatch(events[0],/DTEND:|DURATION:/,'expiry must never be mistaken for an announced event end');
  assert.match(events[1],/DTSTART:20261103T180000Z\r\n/);
  assert.match(events[1],/DTEND:20261103T190000Z\r\n/);
  assert.match(events[1],/SUMMARY:The Tari Show/);
  assert.match(events[1],/Stage/);
  assert.equal(new Set(events.map(e=>e.match(/UID:(.+)\r\n/)[1])).size,2);
  assert.equal(raw,communityCalendar(gameFixture,showFixture),'repeated downloads must not create new event identities');
  for(const event of events)assert.match(event,/TRIGGER:-PT15M/);
  for(const line of raw.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
  assert.doesNotMatch(raw.replaceAll('\r\n',''),/[\r\n]/);
});
test('calendar escapes event text, folds UTF-8 safely, and omits disabled or unconfirmed events',()=>{
  const game={id:'fixture',enabled:true,game:'Play, chat; 👻\nBEGIN:VEVENT',startsAt:'2026-11-01T18:00:00-05:00',channelName:'Game Streams',channelUrl:'https://discord.com/',inviteUrl:'https://discord.gg/tari'};
  const raw=communityCalendar(game,{enabled:false});
  assert.equal((unfold(raw).match(/BEGIN:VEVENT/g)||[]).length,2); // one escaped literal inside the description
  assert.equal(raw.split('\r\n').filter(line=>line==='BEGIN:VEVENT').length,1);
  assert.ok(unfold(raw).includes('Play\\, chat\\; 👻\\nBEGIN:VEVENT'));
  assert.doesNotMatch(communityCalendar({...game,enabled:false},{enabled:false}),/BEGIN:VEVENT/);
  assert.doesNotMatch(communityCalendar({...game,startsAt:'invalid'},{enabled:false}),/BEGIN:VEVENT/);
  const long='DESCRIPTION:'+('👻'.repeat(100));
  assert.equal(unfold(foldCalendarLine(long)),long);
  for(const line of foldCalendarLine(long).split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
});
test('public feed is downloadable without auth and advertises the calendar MIME type',async t=>{
  const app=createInspirationLobby();const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>{server.closeAllConnections();server.close();});
  const response=await fetch(`http://127.0.0.1:${server.address().port}/community/events.ics`);
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/calendar; charset=utf-8/);
  assert.match(response.headers.get('content-disposition'),/tari-community.ics/);
  assert.equal(await response.text(),communityCalendar());
});

test('a revised event keeps its UID and emits its own update timestamp and sequence',()=>{
  const revised=unfold(communityCalendar({...gameFixture,startsAt:'2026-11-01T19:00:00-05:00',calendarUpdatedAt:'2026-10-30T16:00:00Z',calendarSequence:1},showFixture)).split('BEGIN:VEVENT\r\n').slice(1);
  assert.match(revised[0],/UID:2026-11-01-horror-night@lobby.tari.com/);
  assert.match(revised[0],/DTSTART:20261102T000000Z/);
  assert.match(revised[0],/DTSTAMP:20261030T160000Z/);
  assert.match(revised[0],/SEQUENCE:1/);
  assert.match(revised[1],/DTSTAMP:20261029T220000Z/);
  assert.match(revised[1],/SEQUENCE:0/);
});

test('standing game night upgrades the existing UID to a weekly Eastern series without a selected game',()=>{
  const weekly={...gameFixture,game:null,recurrence:{frequency:'weekly',timeZone:'America/New_York'},calendarSequence:1,calendarUpdatedAt:'2026-11-02T15:15:47Z'};
  const raw=unfold(communityCalendar(weekly,showFixture));
  const events=raw.split('BEGIN:VEVENT\r\n').slice(1);
  assert.equal(events.length,2);
  assert.match(events[0],/UID:2026-11-01-horror-night@lobby.tari.com/);
  assert.match(events[0],/SEQUENCE:1/);
  assert.match(events[0],/DTSTART;TZID=America\/New_York:20261101T180000\r\nRRULE:FREQ=WEEKLY\r\n/);
  assert.doesNotMatch(events[0],/DTEND:|DURATION:|R\.E\.P\.O\.|Shift At Midnight|null/);
  assert.doesNotMatch(events[1],/RRULE:/,'a standing game night must not invent recurring Tari Shows');
  assert.match(raw,/BEGIN:VTIMEZONE\r\nTZID:America\/New_York/);
  assert.match(raw,/TZOFFSETFROM:-0500\r\nTZOFFSETTO:-0400\r\nTZNAME:EDT\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU/);
  assert.match(raw,/TZOFFSETFROM:-0400\r\nTZOFFSETTO:-0500\r\nTZNAME:EST\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU/);
  const summer=unfold(communityCalendar({...weekly,startsAt:'2027-07-04T22:00:00Z'},{enabled:false}));
  assert.match(summer,/DTSTART;TZID=America\/New_York:20270704T180000/);
  assert.doesNotMatch(communityCalendar({...weekly,enabled:false},{enabled:false}),/BEGIN:VEVENT|BEGIN:VTIMEZONE/);
});

// The owner confirmed 1 PM Eastern after DST; the scheduled-event time was stale.
test('corrected Tari Show keeps its UID, advances sequence and does not publish banner expiry as an end',()=>{
  const event=unfold(communityCalendar()).split('BEGIN:VEVENT\r\n').find(e=>e.includes('SUMMARY:The Tari Show'));
  assert.ok(event);
  assert.match(event,/UID:2026-11-03-tari-show@lobby.tari.com/);
  assert.match(event,/DTSTART;TZID=America\/New_York:20261103T130000\r\nRRULE:FREQ=WEEKLY/);
  assert.match(event,/SEQUENCE:3/);
  assert.match(event,/event=1516878863127281755/);
  assert.doesNotMatch(event,/DTEND:|DURATION:/);
  assert.match(event,/end time has not been announced/);
});


test('explicit weekly Tari Show includes its timezone without game night and preserves the local start',()=>{
 const weekly={...showFixture,endTimeConfirmed:false,recurrence:{frequency:'weekly',timeZone:'America/New_York'},calendarSequence:3};
 const raw=unfold(communityCalendar({enabled:false},weekly));
 assert.match(raw,/BEGIN:VTIMEZONE\r\nTZID:America\/New_York/);
 assert.match(raw,/UID:2026-11-03-tari-show@lobby.tari.com/);
 assert.match(raw,/DTSTART;TZID=America\/New_York:20261103T130000\r\nRRULE:FREQ=WEEKLY/);
 assert.doesNotMatch(raw,/DTEND:|DURATION:/);
 const summer=unfold(communityCalendar({enabled:false},{...weekly,startsAt:'2027-07-06T17:00:00Z',endsAt:'2027-07-06T18:00:00Z'}));
 assert.match(summer,/DTSTART;TZID=America\/New_York:20270706T130000/);
 assert.doesNotMatch(communityCalendar({enabled:false},{...weekly,enabled:false}),/BEGIN:VEVENT|BEGIN:VTIMEZONE/);
});
