import {describe,it,expect} from 'vitest';
import {gameNightStatus,gameNightDismissalKey,communityBannerState,type GameNight} from './GameNightBanner';
const event:GameNight={id:'test-event',enabled:true,game:'Test game',startsAt:'2026-11-01T23:00:00Z',expiresAt:'2026-11-02T00:30:00Z',channelName:'Game Streams',channelUrl:'https://discord.com/channels/892738558316662855/1558828371100573726',inviteUrl:'https://discord.gg/tari'};
describe('game night announcement lifecycle',()=>{
 it('shows the scheduled session and retires the announcement at its configured expiry',()=>{
  expect(gameNightStatus(event,Date.parse('2026-11-01T22:00Z'))).toEqual({visible:true,scheduled:true,voting:false});
  expect(gameNightStatus(event,Date.parse(event.startsAt!))).toEqual({visible:true,scheduled:true,voting:false});
  expect(gameNightStatus(event,Date.parse(event.expiresAt!))).toEqual({visible:false,scheduled:true,voting:false});
 });
 it('closes voting at the deadline without hiding the event',()=>{
  expect(gameNightStatus({...event,voteClosesAt:'2026-10-31T22:00:00Z'},Date.parse('2026-10-31T21:59Z')).voting).toBe(true);
  expect(gameNightStatus({...event,voteClosesAt:'2026-10-31T22:00:00Z'},Date.parse('2026-10-31T22:00Z')).voting).toBe(false);
 });
 it('keeps incomplete or invalid schedules unconfirmed',()=>{
  for(const input of [{...event,game:null},{...event,startsAt:null},{...event,expiresAt:'invalid'},{...event,expiresAt:event.startsAt}]) {
   expect(gameNightStatus(input).scheduled).toBe(false);
   expect(gameNightStatus(input).voting).toBe(false);
  }
  expect(gameNightStatus({...event,enabled:false}).visible).toBe(false);
 });
 it('shows a new or rescheduled event after a previous announcement was dismissed',()=>{
  const key=gameNightDismissalKey(event);
  for(const input of [{...event,id:'next-event'},{...event,game:'New game'},{...event,startsAt:'2026-11-08T23:00:00Z'},{...event,expiresAt:'2026-11-02T01:00:00Z'}])expect(gameNightDismissalKey(input)).not.toBe(key);
 });
});

describe('shared banner expiry',()=>{
 const game={...event,expiresAt:'2026-11-02T05:00Z'};
 const show={enabled:true,endsAt:'2026-11-03T19:00Z'};
 it('keeps the show after game night ends, and retires both after the show',()=>{
  expect(communityBannerState(Date.parse('2026-10-29T22:00Z'),game,show)).toEqual({gameVisible:true,showVisible:true,count:2});
  expect(communityBannerState(Date.parse('2026-11-02T05:00Z'),game,show)).toEqual({gameVisible:false,showVisible:true,count:1});
  expect(communityBannerState(Date.parse('2026-11-03T19:00Z'),game,show)).toEqual({gameVisible:false,showVisible:false,count:0});
 });
});
