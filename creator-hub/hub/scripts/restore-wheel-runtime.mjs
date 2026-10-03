import { mkdtemp, readFile, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Restore a pinned official dependency without committing its compiled bundle.
const hubRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The Daily Spark wheel silently falls back to a flat wheel without this runtime, so builds restore it when absent.
if (process.argv.includes('--if-missing') && existsSync(join(hubRoot, 'client/public/wheel-lab/vendor/runtime.js'))) process.exit(0);
const temporary = await mkdtemp(join(tmpdir(), 'ootle-wheel-runtime-'));
try {
  execFileSync('npm', ['pack', '@splinetool/runtime@2.0.57', '--pack-destination', temporary, '--ignore-scripts'], { stdio: 'pipe' });
  const archive = join(temporary, 'splinetool-runtime-2.0.57.tgz');
  const sha = createHash('sha256').update(await readFile(archive)).digest('hex');
  if (sha !== '97595b5fb94bd14b621f4e436a1e3fd7f4c18a31e77139a1b759f56ab7dc6f20') throw new Error('Spline runtime checksum mismatch');
  execFileSync('tar', ['-xzf', archive, '-C', temporary]);
  await cp(join(temporary, 'package/build'), join(hubRoot, 'client/public/wheel-lab/vendor'), { recursive: true });
  console.log('Restored verified Spline runtime 2.0.57. Rebuild/copy the static proof before viewing.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
