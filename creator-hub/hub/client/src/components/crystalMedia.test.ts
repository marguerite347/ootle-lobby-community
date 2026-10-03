import {describe, expect, it} from 'vitest';
import {crystalHoldsStill, crystalPlaybackRate, keyBlackPlate} from './crystalMedia';

describe('licensed crystal playback', () => {
  it('keeps idle and settled nearly still, and lifts only for charge and reveal', () => {
    expect(crystalPlaybackRate('idle')).toBeLessThan(crystalPlaybackRate('live'));
    expect(crystalPlaybackRate('live')).toBeLessThan(crystalPlaybackRate('ignited'));
    expect(crystalPlaybackRate('settled')).toBeLessThan(crystalPlaybackRate('live'));
    expect(crystalPlaybackRate('dimmed')).toBe(0);
    expect(crystalPlaybackRate('idle')).toBeGreaterThan(0);
  });

  it('holds the settled read still so the loop seam does not tick', () => {
    expect(crystalHoldsStill('settled')).toBe(true);
    expect(crystalHoldsStill('dimmed')).toBe(true);
    expect(crystalHoldsStill('idle')).toBe(false);
    expect(crystalHoldsStill('live')).toBe(false);
    expect(crystalHoldsStill('ignited')).toBe(false);
  });

  it('clears the black plate and keeps a bright gem facet', () => {
    const pixels = new Uint8ClampedArray([
      0, 0, 0, 255,
      8, 6, 10, 255,
      40, 220, 230, 255,
      30, 30, 34, 255,
    ]);
    keyBlackPlate(pixels);
    expect(pixels[3]).toBe(0);
    expect(pixels[7]).toBe(0);
    expect(pixels[11]).toBe(255);
    expect(pixels[15]).toBeGreaterThan(0);
    expect(pixels[15]).toBeLessThan(255);
  });
});
