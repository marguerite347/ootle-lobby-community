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
