/**
 * Keying helpers for the retained Y6HUAQT derivative.
 * Daily Spark does not mount that plate as the crystal hero.
 */

const IDLE_PLAYBACK_RATE = 0.15;
const CHARGE_PLAYBACK_RATE = 0.55;
const REVEAL_PLAYBACK_RATE = 1;
const SETTLED_PLAYBACK_RATE = 0.12;

/** Poster corners on the derivative measure 0–4. Anything at or under this is the black field. */
const BLACK_PLATE_CUTOFF = 18;
/** Colored gem pixels above this stay opaque. The band between feathers the edge. */
const BLACK_PLATE_SOFT = 42;

export const LICENSED_CRYSTAL_VIDEO = '/daily-spark/y6huaqt/crystal.mp4';
export const LICENSED_CRYSTAL_POSTER = '/daily-spark/y6huaqt/crystal-poster.png';

export function crystalPlaybackRate(mood: string): number {
  if (mood === 'live') return CHARGE_PLAYBACK_RATE;
  if (mood === 'ignited') return REVEAL_PLAYBACK_RATE;
  if (mood === 'settled') return SETTLED_PLAYBACK_RATE;
  if (mood === 'dimmed') return 0;
  return IDLE_PLAYBACK_RATE;
}

/** Settled holds the poster so the known loop seam does not jump during the banked read. */
export function crystalHoldsStill(mood: string): boolean {
  return mood === 'settled' || crystalPlaybackRate(mood) === 0;
}

/**
 * Turn the plate's black field into transparency.
 * Uses the strongest channel so a dark colored facet is not treated as the same black as the field.
 */
export function keyBlackPlate(pixels: Uint8ClampedArray) {
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const peak = Math.max(red, green, blue);
    if (peak <= BLACK_PLATE_CUTOFF) {
      pixels[index + 3] = 0;
      continue;
    }
    if (peak >= BLACK_PLATE_SOFT) continue;
    const keep = (peak - BLACK_PLATE_CUTOFF) / (BLACK_PLATE_SOFT - BLACK_PLATE_CUTOFF);
    pixels[index + 3] = Math.round(pixels[index + 3] * keep);
  }
}
