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

  it('mounts the Lobby Vault Disc without the rejected gem or gold rim', () => {
    const root = resolve(dirname(fileURLToPath(import.meta.url)));
    const view = readFileSync(resolve(root, 'DailyTrivia.tsx'), 'utf8');
    const plates = readFileSync(resolve(root, 'vaultChargeArt.ts'), 'utf8');
    const style = readFileSync(resolve(root, 'DailyTrivia.css'), 'utf8');
    expect(view).not.toContain('CrystalMark');
    expect(view).not.toContain('vault-gate');
    expect(view).toContain('authored-lobby-vault-disc');
    expect(view).toContain('5× · Super path');
    expect(view).toContain('5× held · no extra Sparks.');
    expect(view).toContain('Today’s vault is claimed');
    expect(style).not.toContain('#c7a476');
    expect(style).not.toContain('#efcc87');
    expect(style).not.toContain('#f4e27a');
    expect(style).not.toContain('#e7f0c8');
    expect(style).toContain('.spark-settle-action .spark-play');
    expect(style).toContain('background-image: none');
    expect(style).toContain('width: 34%');
    expect(view).toContain('VAULT_DISC_FACE_SRC');
    const reactor = readFileSync(resolve(root, 'SparkReactor.tsx'), 'utf8');
    expect(reactor).toContain('accepted-spark-crystal-v9');
    expect(reactor).not.toContain('LicensedCrystal');
    expect(reactor).not.toContain('y6huaqt');
    expect(reactor).toContain('<CrystalCanvas');
    expect(reactor).toContain('reward=1&idle=1');
    expect(reactor).not.toContain('<iframe');
    expect(plates).toContain('/daily-spark/vault-disc/vault-disc-face.svg');
    expect(plates).toContain('/daily-spark/vault-disc/vault-disc-rim@2x.png');
    expect(plates).toContain('/daily-spark/vault-disc/vault-disc-rim.svg');
    expect(plates).toContain('9321083acb9ccd4aaedc58b088e38197e3d95cc7c1c0d73d9fa8fe4d04d3182c');
    expect(plates).toContain('/daily-spark/vault-disc/vault-pointer-lime.svg');
    expect(plates).toContain('/daily-spark/vault-disc/vault-gateway-badge.svg');
    const stage = view.slice(view.indexOf('function VaultDisc'), view.indexOf('function DiscPlate'));
    expect(stage.indexOf('vault-spin')).toBeLessThan(stage.indexOf('vault-plate-rim'));
    const superWheel = view.slice(view.indexOf('function SuperWheel'), view.indexOf('function SuperOdds'));
    expect(superWheel).not.toContain('VAULT_DISC_RIM');
  });

  it('marks only a settled 1× keep', () => {
    expect(isKeptBaseSettle({effectiveMultiplier: 1})).toBe(true);
    expect(isKeptBaseSettle({effectiveMultiplier: 2})).toBe(false);
    expect(isKeptBaseSettle({effectiveMultiplier: 1, superFactor: 1})).toBe(false);
    expect(isKeptBaseSettle({effectiveMultiplier: 5, superDeclined: true})).toBe(false);
    expect(isKeptBaseSettle(null)).toBe(false);
  });
});
