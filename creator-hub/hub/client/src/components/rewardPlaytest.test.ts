import {describe, it, expect, vi} from 'vitest';
import {createPlaytestRequest, playtestRequest} from './rewardPlaytest';

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

describe('single current trivia flow', () => {
  it('starts the current replayable flow despite an old URL or stored legacy preference', async () => {
    vi.stubGlobal('window', {location: {hostname: 'ootle-lobby-preview.vercel.app', search: '?rewardPlaytest=0'}});
    vi.stubGlobal('sessionStorage', {getItem: () => '0', setItem: () => {}});
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No legacy requests'));
    try {
      expect((await playtestRequest()).phase).toBe('ready');
      const started = await playtestRequest('start');
      expect(started.round?.id).toMatch(/^playtest-/);
      expect(started.round?.options).toHaveLength(4);
      expect(network).not.toHaveBeenCalled();
    } finally { network.mockRestore(); vi.unstubAllGlobals(); }
  });
});
