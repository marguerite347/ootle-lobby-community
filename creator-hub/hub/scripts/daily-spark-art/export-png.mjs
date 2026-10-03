// Rasterise the Daily Spark SVG plates to the PNG sizes the client loads.
// Needs Playwright with a Chromium build (not a hub dependency): `npx playwright` or a global install.
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ART = resolve(dirname(fileURLToPath(import.meta.url)), '../../client/public/daily-spark');
const PLATES = [
  ['vault-disc/vault-disc-face.svg', 'vault-disc/vault-disc-face.png', 512, 512],
  ['vault-disc/vault-disc-face.svg', 'vault-disc/vault-disc-face@2x.png', 1024, 1024],
  ['vault-disc/vault-disc-rim.svg', 'vault-disc/vault-disc-rim.png', 512, 512],
  ['vault-disc/vault-disc-rim.svg', 'vault-disc/vault-disc-rim@2x.png', 1024, 1024],
  ['vault-disc/vault-gateway-badge.svg', 'vault-disc/vault-gateway-badge.png', 320, 96],
  ['vault-disc/vault-pointer-lime.svg', 'vault-disc/vault-pointer-lime.png', 112, 96],
  ['vault-disc/vault-charge-hero.svg', 'vault-disc/vault-charge-hero.png', 900, 900],
  ['vault-charge/vault-charge-hero.svg', 'vault-charge/vault-charge-hero.png', 900, 900],
];

function framedSvg(source, width, height) {
  const svg = readFileSync(resolve(ART, source), 'utf8')
    .replace(/^<\?xml[^>]*>\s*/, '')
    .replace('<svg ', '<svg style="width:100%;height:100%" preserveAspectRatio="xMidYMid meet" ');
  return `<html><body style="margin:0;background:transparent"><div style="width:${width}px;height:${height}px;display:grid;place-items:center">${svg}</div></body></html>`;
}

const browser = await chromium.launch();
for (const [source, target, width, height] of PLATES) {
  const page = await browser.newPage({viewport: {width, height}});
  await page.setContent(framedSvg(source, width, height));
  await page.screenshot({path: resolve(ART, target), omitBackground: true});
  await page.close();
}
await browser.close();
