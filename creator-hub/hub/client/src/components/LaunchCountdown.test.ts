import {describe,it,expect,vi,afterEach} from 'vitest';
import {launchDateLabel,pollLaunchTarget,remainingLaunchTime,readLaunchTarget} from './launchClock';
const target=Date.parse('2026-11-11T11:11:11Z');
const ok=(value:unknown)=>Promise.resolve({ok:true,json:async()=>value} as Response);
afterEach(()=>vi.useRealTimers());
describe('wallet-sourced Ootle countdown',()=>{
 it('counts against the supplied timestamp, including its seconds and timezone',()=>{
  expect(remainingLaunchTime(target,Date.UTC(2026,10,10,10,10,10))).toEqual({days:1,hours:1,minutes:1,seconds:1,ended:false});
  expect(readLaunchTarget({target:'2026-11-11T12:11:11+01:00'})).toBe(target);
  expect(launchDateLabel(target)).toBe('11/11/2026, 11:11:11 UTC');
 });
 it('waits for the actual final second, then clamps at zero without asserting launch',()=>{
  expect(remainingLaunchTime(target,target-1).ended).toBe(false);
  expect(remainingLaunchTime(target,target)).toEqual({days:0,hours:0,minutes:0,seconds:0,ended:true});
  expect(remainingLaunchTime(target,target+100000).ended).toBe(true);
 });
 it('rejects missing or ambiguous dates',()=>{
  for(const value of [null,{}, {target:'tomorrow'}, {target:'2026-11-11T11:11:11'}])expect(()=>readLaunchTarget(value)).toThrow();
 });
 it('polls changed official dates and preserves the previous value through outages and invalid responses',async()=>{
  vi.useFakeTimers();
  const changed=Date.parse('2026-11-12T14:00:00Z');let latest=target;
  const fetcher=vi.fn<typeof fetch>().mockImplementationOnce(()=>ok({target:new Date(target).toISOString()}))
   .mockRejectedValueOnce(Error('offline')).mockImplementationOnce(()=>ok({target:'invalid'}))
   .mockImplementation(()=>ok({target:new Date(changed).toISOString()}));
  const update=vi.fn((value:number)=>{latest=value;});const poller=pollLaunchTarget(update,fetcher);
  await vi.advanceTimersByTimeAsync(0);expect(update).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(120000);expect(latest).toBe(target);expect(update).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(60000);expect(latest).toBe(changed);expect(update).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[0][0]).toBe('/api/launch');poller.stop();
  await vi.advanceTimersByTimeAsync(60000);expect(fetcher).toHaveBeenCalledTimes(4);
 });
 it('does not populate a countdown when no valid source has ever been returned',async()=>{
  vi.useFakeTimers();const update=vi.fn();const poller=pollLaunchTarget(update,vi.fn<typeof fetch>().mockRejectedValue(Error('offline')));
  await vi.advanceTimersByTimeAsync(60000);expect(update).not.toHaveBeenCalled();poller.stop();
 });
});
