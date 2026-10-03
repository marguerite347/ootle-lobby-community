/** Timing and labels for the daily vault. Credits stay on the server. */

export const REVEAL_HOLD_MS = 2200;
/** Selection holds for reading; the staged unlock remains skippable. */
export const ANSWER_SELECTION_HOLD_MS = 1600;
export const BASE_REVEAL_HOLD_MS = 6800;
/** The wheel holds on the landed wedge before the payout overlay covers it. */
export const LAND_BEAT_MS = 520;
export const COUNT_UP_MS = 700;
export const SPIN_SETTLE_MS = 3400;
export const COIN_COUNT = 12;
export const SECTOR_DEGREES = 60;
export const WHEEL_EXTRA_TURNS = 5;

export type ReactorMood = 'idle' | 'live' | 'ignited' | 'settled' | 'dimmed';
export type SparkCue = 'start' | 'select' | 'win' | 'spin' | 'tick' | 'miss' | 'clack' | 'unlock' | 'bank' | 'superSpin' | 'payout' | 'bigPayout' | 'jackpot';
export type CelebrationKind = 'base' | 'bonus' | 'replay' | 'super';
export type RevealTier = 'quiet' | 'mid' | 'top';
export type SuperSpinRow = {factor: number; percent: number; effective: number};

const SUPER_WEDGE_COLORS = ['#241833', '#5a2fb8', '#3d1f7a', '#dcfa53'];

export function decorativeMotionAllowed(effectsOff: boolean, reducedMotion: boolean): boolean {
  return !effectsOff && !reducedMotion;
}

export function spinDurationMs(motionAllowed: boolean): number {
  return motionAllowed ? SPIN_SETTLE_MS : 0;
}

export function reactorMood(phase: string | undefined, revealing: boolean, expired: boolean): ReactorMood {
  if (revealing) return 'ignited';
  if (expired || phase === 'lost') return 'dimmed';
  if (phase === 'playing') return 'live';
  if (phase === 'won' || phase === 'complete' || phase === 'super') return 'settled';
  return 'idle';
}

export function bonusSparks(base: number, total: number): number {
  const safeBase = Number.isFinite(base) ? base : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;
  return Math.max(0, safeTotal - safeBase);
}

export function shouldPlayCue(soundEnabled: boolean, documentHidden: boolean): boolean {
  return soundEnabled && !documentHidden;
}

/** A visual replay never issues Sparks. */
export function replayCredits(): number {
  return 0;
}

/**
 * Turn the chosen wedge center up to the pointer.
 * CSS conic gradients start at the top and move clockwise.
 */
export function wheelRotationDegrees(spinIndex: number | null | undefined): number {
  if (spinIndex == null || !Number.isInteger(spinIndex) || spinIndex < 0) return 0;
  const wedgeCenter = spinIndex * SECTOR_DEGREES + SECTOR_DEGREES / 2;
  return WHEEL_EXTRA_TURNS * 360 + 360 - wedgeCenter;
}

export function wedgeLandsOnPointer(spinIndex: number): boolean {
  const wedgeCenter = spinIndex * SECTOR_DEGREES + SECTOR_DEGREES / 2;
  return (wedgeCenter + wheelRotationDegrees(spinIndex)) % 360 === 0;
}

export function revealTier(kind: CelebrationKind, amount: number, effective = 0): RevealTier {
  if (kind === 'replay') return 'mid';
  if (kind === 'base' || amount <= 0) return 'quiet';
  if (kind === 'super' && effective >= 50) return 'top';
  if (kind === 'super' && effective >= 10) return 'mid';
  if (kind === 'bonus' && amount > 0) return 'mid';
  return 'quiet';
}

export function revealHoldMs(kind: CelebrationKind): number {
  return kind === 'base' ? BASE_REVEAL_HOLD_MS : REVEAL_HOLD_MS;
}

/** Wheel landing weight by multiplier: a 1× keep only ticks, 2×/3× pop, 5× keeps its gateway treatment. */
export function landingTier(multiplier: number | undefined): 'tick' | 'pop' | 'gateway' {
  if (multiplier == null || multiplier <= 1) return 'tick';
  if (multiplier >= 5) return 'gateway';
  return 'pop';
}

/** Eased count from the base to the banked total; always ends exactly on the total. */
export function countUpValue(from: number, to: number, progress: number): number {
  const k = Math.min(1, Math.max(0, progress));
  if (k >= 1) return to;
  const eased = 1 - Math.pow(1 - k, 3);
  return Math.round(from + (to - from) * eased);
}

export function confettiCount(tier: RevealTier): number {
  if (tier === 'top') return 64;
  if (tier === 'mid') return 28;
  return 0;
}

export function celebrationLabel(kind: CelebrationKind, amount: number, effective = 0): { kicker: string; detail: string } {
  if (kind === 'replay') return { kicker: 'One more look.', detail: 'No extra points.' };
  if (kind === 'base') return { kicker: 'You nailed it.', detail: 'Next up: the multiplier.' };
  if (kind === 'super' && (amount <= 0 || effective <= 5)) return { kicker: '5× held.', detail: '5× held · no extra Sparks.' };
  if (kind === 'super' && effective >= 50) return { kicker: 'NO SHOT.', detail: 'Top path only.' };
  if (kind === 'super' && effective >= 10) return { kicker: 'RNG went crazy.', detail: `${effective}× is banked.` };
  if (kind === 'bonus' && amount <= 0) return { kicker: 'Base kept.', detail: 'A 1× wedge keeps the base.' };
  if (kind === 'bonus' && effective === 5) return { kicker: 'Wait… bonus round?', detail: '5× is already banked.' };
  if (kind === 'bonus' && amount > 0) return { kicker: 'Loot secured.', detail: `${effective}× landed · bonus on top of your base.` };
  return { kicker: 'Base kept.', detail: 'A 1× wedge keeps the base.' };
}

export function formatPathPercent(percent: number): string {
  if (!Number.isFinite(percent)) return '—';
  return `${percent.toFixed(2)}%`;
}

export function superWedgeSweep(percent: number): number {
  return (percent / 100) * 360;
}

export function superOddsSum(rows: SuperSpinRow[]): number {
  return rows.reduce((sum, row) => sum + row.percent, 0);
}

export function superWedgeCenter(rows: SuperSpinRow[], factor: number): number {
  let start = 0;
  for (const row of rows) {
    const sweep = superWedgeSweep(row.percent);
    if (row.factor === factor) return start + sweep / 2;
    start += sweep;
  }
  return 0;
}

/** Extra turns, then the chosen wedge center sits under the top pointer. */
export function superWheelRotation(rows: SuperSpinRow[], factor: number): number {
  return WHEEL_EXTRA_TURNS * 360 + 360 - superWedgeCenter(rows, factor);
}

/** Rest the pointer in the common wedge, not on the rare sliver. */
export function superIdleRotation(rows: SuperSpinRow[]): number {
  const common = rows[0];
  if (!common) return 0;
  return 360 - superWedgeCenter(rows, common.factor);
}

export function superWheelGradient(rows: SuperSpinRow[]): string {
  let start = 0;
  const stops = rows.map((row, index) => {
    const sweep = superWedgeSweep(row.percent);
    const color = SUPER_WEDGE_COLORS[index] || SUPER_WEDGE_COLORS[SUPER_WEDGE_COLORS.length - 1];
    const stop = `${color} ${start}deg ${start + sweep}deg`;
    start += sweep;
    return stop;
  });
  return `conic-gradient(${stops.join(',')})`;
}

export function vaultHeading(input: {
  spinning: boolean;
  superSpin: boolean;
  phase: string;
  base: number;
  total: number;
  effective?: number | null;
  superFactor?: number | null;
  superDeclined?: boolean;
}): string {
  if (input.spinning && input.superSpin) return 'Super Spin is settling…';
  if (input.spinning) return 'Let the wheel cook.';
  if (input.phase === 'super') return 'Wait… bonus round?';
  if (input.phase === 'won') return 'Let the wheel cook.';
  if (input.phase !== 'complete') return `${input.base} Sparks banked.`;
  if (input.superDeclined) return `${input.total} Sparks banked.`;
  if (input.effective === 50) return 'NO SHOT.';
  if (input.superFactor === 1) return '5× held.';
  if (input.effective === 1) return 'Base kept.';
  if (input.effective === 10 || input.effective === 25) return 'RNG went crazy.';
  if (input.effective === 2 || input.effective === 3) return 'Loot secured.';
  return `${input.total} Sparks banked.`;
}

/** Payouts the pre-spin strip may preview. They follow the server base and stage-1 multipliers. */
export function payoutPreview(base: number): { kept: number; midLow: number; midHigh: number; gateway: number } {
  const safeBase = Number.isFinite(base) ? base : 0;
  return { kept: safeBase, midLow: safeBase * 2, midHigh: safeBase * 3, gateway: safeBase * 5 };
}

export function settledRevealTier(effective?: number | null, superFactor?: number | null): RevealTier | null {
  if (effective === 50) return 'top';
  if (effective === 1 || superFactor === 1) return 'quiet';
  return null;
}
