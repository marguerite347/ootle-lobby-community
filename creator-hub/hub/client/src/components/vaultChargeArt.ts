/** Authored Lobby Vault Charge v3.1. The displayed hero is the stamped PNG, not the Y6 plate. */

export const AUTHORED_LOBBY_VAULT_CHARGE = 'authored-lobby-vault-charge';
export const VAULT_CHARGE_HERO_SRC = '/daily-spark/vault-charge/vault-charge-hero.png';
export const VAULT_CHARGE_HERO_SVG = '/daily-spark/vault-charge/vault-charge-hero.svg';
export const VAULT_CHARGE_HERO_SHA256 = 'f038205b9a4522665cd3c4f66a37e6aed0478ce826e51d622a27d62bd293b076';

/** Lobby Vault Disc plates. Face/rim/pointer/badge come from the assets pack. */
export const AUTHORED_LOBBY_VAULT_DISC = 'authored-lobby-vault-disc';
export const VAULT_DISC_FACE_SRC = '/daily-spark/vault-disc/vault-disc-face.svg';
/** Soft-fuse rim. The @2x PNG bakes “5× · Super path” into the stage arc. */
export const VAULT_DISC_RIM_PNG = '/daily-spark/vault-disc/vault-disc-rim@2x.png';
export const VAULT_DISC_RIM_SRC = '/daily-spark/vault-disc/vault-disc-rim.svg';
export const VAULT_DISC_RIM_SHA256 = '9321083acb9ccd4aaedc58b088e38197e3d95cc7c1c0d73d9fa8fe4d04d3182c';
export const VAULT_DISC_POINTER_SRC = '/daily-spark/vault-disc/vault-pointer-lime.svg';
export const VAULT_DISC_BADGE_SRC = '/daily-spark/vault-disc/vault-gateway-badge.svg';

/** Ready screen lines. These stay off the settled ledger. */
export const IDLE_READY_CHROME = {
  heading: 'Lock in.',
  emphasis: 'Get your loot.',
  support: 'Beat the question. Spin for the multiplier.',
} as const;

/** Settled 1× lines that sit with the crystal. Heading stays on vaultHeading. */
export const SETTLED_KEEP_CHROME = {
  support: 'A 1× wedge keeps the base.',
  caption: 'The vault cools. Banked Sparks stay loud.',
  action: 'Continue',
  sparksNote: 'Sparks are not TARI.',
} as const;

export function isKeptBaseSettle(round: {
  effectiveMultiplier?: number | null;
  superFactor?: number | null;
  superDeclined?: boolean;
} | null | undefined): boolean {
  if (!round || round.superDeclined || round.superFactor) return false;
  return round.effectiveMultiplier === 1;
}
