import {copyFile, mkdir, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';

// Vite clears dist on every build. Restore only the approved, versioned review exports.
const hub = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await access(resolve(hub, 'client/dist/index.html'));
const assets = resolve(hub, '../handoff/reward-proof/assets');
const destination = resolve(hub, 'client/dist/review');
await mkdir(destination, {recursive: true});
for (const [source, target] of [
  ['ac-vfx-v1/reward-vfx-proof.mp4', 'reward-vfx-proof.mp4'],
  ['starter-01-03-v1/starter-proof.mp4', 'starter-proof.mp4'],
  ['wheel-pass-v4/wheel-pass-proof.mp4', 'wheel-pass-proof.mp4'],
]) {
  await copyFile(resolve(assets, source), resolve(destination, target));
  console.log(`Staged ${target}`);
}
