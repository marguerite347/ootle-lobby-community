import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  AUTHORED_LOBBY_VAULT_CHARGE,
  IDLE_READY_CHROME,
  SETTLED_KEEP_CHROME,
  VAULT_CHARGE_HERO_SHA256,
  VAULT_CHARGE_HERO_SRC,
  isKeptBaseSettle,
} from './vaultChargeArt';

describe('authored lobby vault charge', () => {
  it('points Daily Spark at the stamped hero and not the Y6 plate', () => {
    expect(AUTHORED_LOBBY_VAULT_CHARGE).toBe('authored-lobby-vault-charge');
    expect(VAULT_CHARGE_HERO_SRC).toBe('/daily-spark/vault-charge/vault-charge-hero.png');
    expect(VAULT_CHARGE_HERO_SRC.toLowerCase()).not.toContain('y6');
    const heroPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../public/daily-spark/vault-charge/vault-charge-hero.png');
    const hash = createHash('sha256').update(readFileSync(heroPath)).digest('hex');
    expect(hash).toBe(VAULT_CHARGE_HERO_SHA256);
  });

  it('keeps settle copy off the ready lines', () => {
    const ready = `${IDLE_READY_CHROME.heading} ${IDLE_READY_CHROME.emphasis} ${IDLE_READY_CHROME.support}`;
    expect(ready).toBe('Lock in. Get your loot. Beat the question. Spin for the multiplier.');
    expect(ready).not.toContain(SETTLED_KEEP_CHROME.caption);
    expect(ready).not.toContain('Base kept');
    expect(ready).not.toContain(SETTLED_KEEP_CHROME.action);
  });

  it('marks only a settled 1× keep', () => {
    expect(isKeptBaseSettle({effectiveMultiplier: 1})).toBe(true);
    expect(isKeptBaseSettle({effectiveMultiplier: 2})).toBe(false);
    expect(isKeptBaseSettle({effectiveMultiplier: 1, superFactor: 1})).toBe(false);
    expect(isKeptBaseSettle({effectiveMultiplier: 5, superDeclined: true})).toBe(false);
    expect(isKeptBaseSettle(null)).toBe(false);
  });
});
