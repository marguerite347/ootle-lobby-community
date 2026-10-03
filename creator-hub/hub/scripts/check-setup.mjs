import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const available = command => spawnSync(command, ['--version'], {stdio:'ignore'}).status === 0;
const installed = name => {try {require.resolve(name); return true;} catch {return false;}};
const presence = value => value ? 'present; access unverified' : 'missing';
const checks = {
  node: Number(process.versions.node.split('.')[0]) >= 20 ? 'ready' : 'requires Node 20+',
  git: available('git') ? 'ready' : 'missing',
  npm: available('npm') ? 'ready' : 'missing',
  hubDependencies: installed('express') && installed('vite') ? 'present' : 'run npm ci',
  ffmpeg: available('ffmpeg') ? 'present' : 'not on PATH; needed for media workflow',
  ffprobe: available('ffprobe') ? 'present' : 'not on PATH; needed for media validation',
  huggingFaceToken: presence(process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN),
  hubAiDrafting: process.env.HF_DRAFT_ENABLED === '1' ? 'enabled; model, quota and access unverified' : 'disabled',
  elevenLabsToken: presence(process.env.ELEVENLABS_API_KEY),
  unityCli: available('unity') ? 'present; Editor license and Pipeline connection need verification' : 'not on PATH; optional for Unity projects; see /skills?q=Unity%20AI%20CLI',
  envato: 'manual check: signed-in agent browser, selected asset/editor entitlement and generation credits',
  currentMedia: 'restore from handoff and verify playback; not checked by this command',
  renderRuntime: 'check the selected project lockfile, Remotion browser and short render',
};
console.log(JSON.stringify({scope:'Local presence only; no provider requests, secret values or credit usage.', checks},null,2));
