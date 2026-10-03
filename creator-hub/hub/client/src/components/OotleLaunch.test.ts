import {describe,it,expect} from 'vitest';
import {remainingLaunchTime} from './OotleLaunch';
describe('Ootle countdown',()=>{
 it('targets 11:11 UTC on November 11, independent of browser timezone',()=>{
  expect(remainingLaunchTime(Date.UTC(2026,10,10,10,10,10))).toEqual({days:1,hours:1,minutes:0,seconds:50,ended:false});
 });
 it('stops at zero without asserting network launch',()=>{
  expect(remainingLaunchTime(Date.UTC(2026,10,11,11,11))).toEqual({days:0,hours:0,minutes:0,seconds:0,ended:true});
  expect(remainingLaunchTime(Date.UTC(2027,0,1)).ended).toBe(true);
 });
});
