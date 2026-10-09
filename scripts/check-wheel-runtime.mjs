import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wheelRuntimeOptions} from '../creator-hub/hub/client/public/wheel-lab/runtime-options.mjs';

// Exercise the pinned Spline loaders, including real WASM initialization, while
// denying every external fetch just as the production CSP does. Run after restore:wheel.
const origin='https://wheel.example';
const options=wheelRuntimeOptions(origin+'/wheel-lab/native.js');
const requests=[];
const originalFetch=globalThis.fetch;
globalThis.fetch=async location=>{
  const url=new URL(location);
  assert.equal(url.origin,origin,'Wheel geometry must not depend on an external CDN');
  assert.match(url.pathname,/^\/wheel-lab\/vendor\/(bevel|process)\.wasm$/);
  requests.push(url.pathname);
  return new Response(await readFile(new URL('../creator-hub/hub/client/public'+url.pathname,import.meta.url)),{headers:{'content-type':'application/wasm'}});
};
try {
  const {x:loadBevel,H:loadProcess}=await import('../creator-hub/hub/client/public/wheel-lab/vendor/runtime-chunk-UM2WZDTE.js');
  await loadBevel(options.wasmPath);
  await loadProcess(options.wasmPath);
  assert.deepEqual(requests,['/wheel-lab/vendor/bevel.wasm','/wheel-lab/vendor/process.wasm']);
  console.log('Pinned wheel geometry WASM initializes with all external fetches denied.');
} finally {globalThis.fetch=originalFetch;}
