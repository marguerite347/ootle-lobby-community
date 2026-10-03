import {describe, expect, it} from 'vitest';
import {
  BASE_REVEAL_HOLD_MS,
  REVEAL_HOLD_MS,
  bonusSparks,
  celebrationLabel,
  countUpValue,
  landingTier,
  revealHoldMs,
  confettiCount,
  decorativeMotionAllowed,
  formatPathPercent,
  reactorMood,
  replayCredits,
  revealTier,
  shouldPlayCue,
  spinDurationMs,
  superIdleRotation,
  superOddsSum,
  superWedgeCenter,
  superWedgeSweep,
  superWheelRotation,
  payoutPreview,
  vaultHeading,
  wedgeLandsOnPointer,
  wheelRotationDegrees,
  type SuperSpinRow,
} from './sparkPresentation';

const SUPER_ROWS: SuperSpinRow[] = [
  {factor: 1, percent: 60, effective: 5},
  {factor: 2, percent: 25, effective: 10},
  {factor: 5, percent: 12, effective: 25},
  {factor: 10, percent: 3, effective: 50},
];

describe('vault presentation', () => {
  it('lands every wedge under the pointer', () => {
    for (const index of [0, 1, 2, 3, 4, 5]) expect(wedgeLandsOnPointer(index)).toBe(true);
    expect(wheelRotationDegrees(null)).toBe(0);
    expect(wheelRotationDegrees(-1)).toBe(0);
  });

  it('keeps the base when a spin adds nothing', () => {
    expect(bonusSparks(150, 150)).toBe(0);
    expect(bonusSparks(150, 750)).toBe(600);
    expect(bonusSparks(150, 0)).toBe(0);
  });

  it('names a quiet keep apart from a real bonus', () => {
    expect(celebrationLabel('bonus', 0, 1)).toEqual({kicker: 'Base kept.', detail: 'A 1× wedge keeps the base.'});
    expect(celebrationLabel('super', 0, 5)).toEqual({kicker: '5× held.', detail: '5× held · no extra Sparks.'});
    expect(celebrationLabel('bonus', 150, 2).kicker).toBe('Loot secured.');
    expect(celebrationLabel('bonus', 600, 5).kicker).toBe('Wait… bonus round?');
    expect(celebrationLabel('super', 750, 10).kicker).toBe('RNG went crazy.');
    expect(celebrationLabel('super', 6750, 50).kicker).toBe('NO SHOT.');
    expect(celebrationLabel('base', 150).kicker).toBe('You nailed it.');
    expect(celebrationLabel('replay', 300).detail).toBe('No extra points.');
    expect(revealTier('base', 150)).toBe('quiet');
    expect(revealTier('bonus', 0, 1)).toBe('quiet');
    expect(revealTier('super', 0, 5)).toBe('quiet');
    expect(revealTier('bonus', 150, 2)).toBe('mid');
    expect(revealTier('super', 750, 10)).toBe('mid');
    expect(revealTier('super', 3000, 25)).toBe('mid');
    expect(revealTier('super', 6750, 50)).toBe('top');
    expect(confettiCount('quiet')).toBe(0);
    expect(confettiCount('mid')).toBe(28);
    expect(confettiCount('top')).toBe(64);
  });

  it('suppresses decoration and cues that must not keep running', () => {
    expect(decorativeMotionAllowed(true, false)).toBe(false);
    expect(decorativeMotionAllowed(false, true)).toBe(false);
    expect(spinDurationMs(false)).toBe(0);
    expect(spinDurationMs(true)).toBe(3400);
    expect(shouldPlayCue(true, true)).toBe(false);
    expect(shouldPlayCue(false, false)).toBe(false);
    expect(shouldPlayCue(true, false)).toBe(true);
    expect(replayCredits()).toBe(0);
  });

  it('maps the round onto one reactor mood', () => {
    expect(reactorMood('won', true, false)).toBe('ignited');
    expect(reactorMood('won', false, false)).toBe('settled');
    expect(reactorMood('complete', false, false)).toBe('settled');
    expect(reactorMood('playing', false, false)).toBe('live');
    expect(reactorMood('playing', false, true)).toBe('dimmed');
    expect(reactorMood('lost', false, false)).toBe('dimmed');
    expect(reactorMood('ready', false, false)).toBe('idle');
    expect(reactorMood('super', false, false)).toBe('settled');
  });

  it('publishes unequal Super arcs and a 50× label', () => {
    expect(superOddsSum(SUPER_ROWS)).toBe(100);
    expect(superWedgeSweep(60)).toBeCloseTo(216);
    expect(superWedgeSweep(25)).toBeCloseTo(90);
    expect(superWedgeSweep(12)).toBeCloseTo(43.2);
    expect(superWedgeSweep(3)).toBeCloseTo(10.8);
    expect(new Set(SUPER_ROWS.map((row) => superWedgeSweep(row.percent))).size).toBe(4);
    const rareCenter = superWedgeCenter(SUPER_ROWS, 10);
    expect(rareCenter).toBeGreaterThan(340);
    expect((superWheelRotation(SUPER_ROWS, 10) + rareCenter) % 360).toBeCloseTo(0);
    expect((superIdleRotation(SUPER_ROWS) + superWedgeCenter(SUPER_ROWS, 1)) % 360).toBeCloseTo(0);
    expect(formatPathPercent(0.5)).toBe('0.50%');
    expect(celebrationLabel('super', 6750, 50).kicker).toBe('NO SHOT.');
    expect(celebrationLabel('super', 0, 5).kicker).toBe('5× held.');
    expect(celebrationLabel('bonus', 0, 1).detail).toBe('A 1× wedge keeps the base.');
  });

  it('uses the server total for a full spin, a skip, and reduced motion', () => {
    const serverTotal = 1500;
    expect(spinDurationMs(false)).toBe(0);
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'complete', base: 150, total: serverTotal, effective: 10})).toBe('RNG went crazy.');
    expect(vaultHeading({spinning: false, superSpin: true, phase: 'complete', base: 150, total: serverTotal, effective: 10})).toBe('RNG went crazy.');
    expect(vaultHeading({spinning: true, superSpin: true, phase: 'complete', base: 150, total: serverTotal})).toBe('Super Spin is settling…');
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'won', base: 150, total: 150})).toBe('Let the wheel cook.');
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'super', base: 150, total: 750, effective: 5})).toBe('Wait… bonus round?');
    expect(payoutPreview(150)).toEqual({ kept: 150, midLow: 300, midHigh: 450, gateway: 750 });
    expect(payoutPreview(100).gateway).toBe(500);
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'complete', base: 150, total: 150, effective: 1})).toBe('Base kept.');
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'complete', base: 150, total: 7500, effective: 50, superFactor: 10})).toBe('NO SHOT.');
    expect(vaultHeading({spinning: false, superSpin: false, phase: 'complete', base: 150, total: 750, effective: 5, superDeclined: true})).toBe('750 Sparks banked.');
  });

  it('stages the game-feel beats in proportion to the real outcome', () => {
    expect(revealHoldMs('base')).toBe(BASE_REVEAL_HOLD_MS);
    expect(revealHoldMs('bonus')).toBe(REVEAL_HOLD_MS);
    expect(BASE_REVEAL_HOLD_MS).toBeGreaterThan(REVEAL_HOLD_MS);
    expect(landingTier(1)).toBe('tick');
    expect(landingTier(undefined)).toBe('tick');
    expect(landingTier(2)).toBe('pop');
    expect(landingTier(3)).toBe('pop');
    expect(landingTier(5)).toBe('gateway');
  });

  it('counts the banked value up and always ends on the server total', () => {
    expect(countUpValue(150, 450, 0)).toBe(150);
    expect(countUpValue(150, 450, 1)).toBe(450);
    expect(countUpValue(150, 450, 1.7)).toBe(450);
    const mid = countUpValue(150, 450, 0.5);
    expect(mid).toBeGreaterThan(150);
    expect(mid).toBeLessThan(450);
  });

  it('labels a bonus as added on top of the base, not as the banked total', () => {
    expect(celebrationLabel('bonus', 300, 3)).toEqual({kicker: 'Loot secured.', detail: '3× landed · bonus on top of your base.'});
  });
});
