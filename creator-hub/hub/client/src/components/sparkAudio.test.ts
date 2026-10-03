import {describe, expect, it} from 'vitest';
import {createSparkAudio} from './sparkAudio';

type GainCall = {method: string; value?: number};

function fakeAudioContext() {
  const calls: GainCall[] = [];
  const frequencies: number[] = [];
  let closed = false;
  function automation() {
    return {
      value: 1,
      cancelScheduledValues() { calls.push({method: 'cancel'}); },
      setValueAtTime(value: number) { calls.push({method: 'set', value}); },
      linearRampToValueAtTime() { calls.push({method: 'linear'}); },
      exponentialRampToValueAtTime() { calls.push({method: 'exponential'}); },
    };
  }
  function gainNode() {
    const gain = automation();
    return {gain, connect() {}, disconnect() {}};
  }
  return {
    currentTime: 0,
    destination: {},
    resume() {},
    close() { closed = true; },
    createGain: gainNode,
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime(value: number) { frequencies.push(value); },
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
        start() {},
        stop() {},
        onended: null as null | (() => void),
      };
    },
    calls,
    frequencies,
    wasClosed: () => closed,
  };
}

describe('spark audio bus', () => {
  it('cuts the master bus before closing on mute', () => {
    const context = fakeAudioContext();
    const audio = createSparkAudio({createContext: () => context as unknown as AudioContext, random: () => 0});
    audio.enable();
    audio.play('tick');
    audio.dispose();
    const gainSets = context.calls.filter((call) => call.method === 'set').map((call) => call.value);
    expect(gainSets[gainSets.length - 1]).toBe(0);
    expect(context.wasClosed()).toBe(true);
    expect(context.frequencies[0]).toBeCloseTo(900 * 0.96);
  });

  it('does not schedule cues before enable', () => {
    const context = fakeAudioContext();
    const audio = createSparkAudio({createContext: () => context as unknown as AudioContext});
    audio.play('win');
    expect(context.frequencies).toEqual([]);
    audio.dispose();
  });
  it('keeps the jackpot voice budget bounded and releases every oscillator', () => {
    const context = fakeAudioContext();
    let created = 0, stopped = 0, disconnected = 0;
    const create = context.createOscillator;
    context.createOscillator = () => {
      const oscillator = create();
      created += 1;
      oscillator.stop = () => { stopped += 1; };
      oscillator.disconnect = () => { disconnected += 1; };
      queueMicrotask(() => oscillator.onended?.());
      return oscillator;
    };
    const audio = createSparkAudio({createContext: () => context as unknown as AudioContext});
    audio.enable();
    audio.play('jackpot');
    expect(created).toBeGreaterThan(0);
    expect(created).toBeLessThanOrEqual(112);
    expect(stopped).toBe(created);
    return Promise.resolve().then(() => {
      expect(disconnected).toBe(created);
      audio.dispose();
    });
  });

});
