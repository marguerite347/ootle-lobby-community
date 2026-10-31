import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('creator-hub/hub/client/src/imageVariants.json', root)));
function asset(path) {
  return new URL(path.startsWith('/previews/')
    ? `creator-hub/hub/data/seed/${path.slice(1)}`
    : `creator-hub/hub/client/public${path}`, root);
}

test('web image derivatives match their reviewed source and remain within the image budget', () => {
  for (const [source, variants] of Object.entries(manifest)) {
    const hash = createHash('sha256').update(readFileSync(asset(source))).update('webp-q86-alpha100-m6-v1').digest('hex').slice(0, 16);
    for (const variant of variants) {
      assert.ok(variant.src.includes(`/${hash}-${variant.width}.webp`), `Regenerate stale derivative: ${source}`);
      assert.ok(statSync(asset(variant.src)).size < 250_000, `Oversized web derivative: ${source}`);
      assert.ok(variant.width <= 960, `Oversized dimensions: ${source}`);
    }
  }
});
