import {describe, it, expect, vi} from 'vitest';
import {createPlaytestRequest, isRewardPlaytest} from './rewardPlaytest';

describe('isolated reward playtest', () => {
  it('runs both jackpots without network writes and ignores duplicate settlement', async () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No network allowed'));
    let time = 1000;
    const play = createPlaytestRequest(0, () => time);
    const ready = await play();
    expect(ready.phase).toBe('ready');
    expect(ready.maxPathPercent).toBeCloseTo(100/72);
    expect(ready.round).toBeNull();
    const question = await play('start');
    expect(question.round!.question).toBeTruthy();
    expect(question.round!.options).toHaveLength(4);
    time += 1000;
    const input = {roundId: question.round!.id, optionId: '0'};
    expect((await play('answer', input)).balance).toBe(150);
    expect((await play('spin', input)).balance).toBe(750);
    expect((await play('spin', input)).balance).toBe(750);
    expect((await play('super', input)).balance).toBe(15000);
    expect((await play('super', input)).balance).toBe(15000);
    expect(network).not.toHaveBeenCalled(); network.mockRestore();
  });
  it.each([1,2,5,10,20] as const)('applies %sx to the banked haul exactly once', async factor => {
    const play=createPlaytestRequest(0,()=>1000,factor);
    const question=await play('start'), input={roundId:question.round!.id,optionId:'0'};
    await play('answer',input);await play('spin',input);
    const settled=await play('super',input);
    expect(settled.balance).toBe(750*factor);
    expect(settled.round!.effectiveMultiplier).toBe(5*factor);
    expect((await play('super',input)).balance).toBe(750*factor);
    expect(settled.superSpins!.reduce((sum,row)=>sum+row.percent,0)).toBeCloseTo(100);
  });
  it('supports wrong answers, expiry and keeping the banked reward', async () => {
    let time=1000;
    const wrong=createPlaytestRequest(1,()=>time);
    const question=await wrong('start');
    expect((await wrong('answer',{roundId:question.round!.id,optionId:'2'})).phase).toBe('lost');
    const expired=createPlaytestRequest(0,()=>time);
    await expired('start'); time+=20001;
    expect((await expired()).phase).toBe('lost');
    const keep=createPlaytestRequest(0,()=>time);
    const next=await keep('start'); const input={roundId:next.round!.id,optionId:'0'};
    time+=9000;
    expect((await keep('answer',input)).balance).toBe(100);
    await keep('spin',input);
    expect((await keep('decline',input)).balance).toBe(500);
    expect((await keep('super',input)).balance).toBe(500);
  });
});

// A project link drops query parameters; that must not switch a test to real rewards.
describe('playtest navigation', () => {
  it('keeps opt-in through navigation and reload, and permits explicit exit', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value)});
    const location = {search: '?rewardPlaytest=1'};
    vi.stubGlobal('window', {location});
    expect(isRewardPlaytest()).toBe(true);
    location.search = '';
    expect(isRewardPlaytest()).toBe(true);
    location.search = '?rewardPlaytest=0';
    expect(isRewardPlaytest()).toBe(false);
    location.search = '';
    expect(isRewardPlaytest()).toBe(false);
    vi.unstubAllGlobals();
  });
});


describe('current wheel in local previews', () => {
  it.each(['localhost', '127.0.0.1', '[::1]'])('defaults %s to the current flow without an opt-in', hostname => {
    vi.stubGlobal('window', {location: {hostname, search: ''}});
    vi.stubGlobal('sessionStorage', {getItem: () => null});
    expect(isRewardPlaytest()).toBe(true);
    vi.unstubAllGlobals();
  });
  it('does not carry a legacy comparison into normal local navigation', () => {
    const values = new Map<string, string>([['ootle-reward-playtest', '0']]);
    vi.stubGlobal('sessionStorage', {getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value)});
    const location = {hostname: 'localhost', search: '?rewardPlaytest=0'};
    vi.stubGlobal('window', {location});
    expect(isRewardPlaytest()).toBe(false);
    location.search = '';
    expect(isRewardPlaytest()).toBe(true);
    expect(values.get('ootle-reward-playtest')).toBe('0');
    vi.unstubAllGlobals();
  });
  it('uses the current flow when local storage is restricted', () => {
    vi.stubGlobal('window', {location: {hostname: 'localhost', search: ''}});
    vi.stubGlobal('sessionStorage', {getItem: () => {throw new Error('Blocked');}});
    expect(isRewardPlaytest()).toBe(true);
    vi.unstubAllGlobals();
  });
  it('does not opt a fresh hosted visit into simulated rewards', async () => {
    vi.resetModules();
    const {isRewardPlaytest: freshVisit} = await import('./rewardPlaytest');
    vi.stubGlobal('window', {location: {hostname: 'lobby.example.com', search: ''}});
    vi.stubGlobal('sessionStorage', {getItem: () => null});
    expect(freshVisit()).toBe(false);
    vi.unstubAllGlobals();
  });
});
