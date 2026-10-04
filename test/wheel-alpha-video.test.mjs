import test from 'node:test';
import assert from 'node:assert/strict';
import {selectAlphaVideoSource} from '../creator-hub/hub/client/public/wheel-lab/alpha-video.mjs';
const sources={webm:'sparks.webm',hevc:'sparks.mov'};
for (const [browser,userAgent,expected] of [
  ['iPhone Safari','Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1','sparks.mov'],
  ['iPhone Chrome','Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/140.0 Mobile/15E148 Safari/604.1','sparks.mov'],
  ['iPhone Firefox','Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 FxiOS/140.0 Mobile/15E148 Safari/604.1','sparks.mov'],
  ['iPad desktop mode','Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15','sparks.mov'],
  ['desktop Chrome with HEVC support','Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0 Safari/537.36','sparks.webm'],
  ['Android Chrome','Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36','sparks.webm'],
  ['Firefox','Mozilla/5.0 Gecko/20100101 Firefox/140.0','sparks.webm'],
]) test(`${browser} selects its transparent codec`,()=>{
  assert.equal(selectAlphaVideoSource({userAgent,canPlayType:()=> 'probably'},sources),expected);
});
test('unsupported transparent codec omits decoration instead of showing opaque video',()=>{
  assert.equal(selectAlphaVideoSource({userAgent:'AppleWebKit/605.1.15',canPlayType:type=>type.includes('vp9')?'probably':''},sources),null);
});
