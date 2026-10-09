/** Keep Spline geometry helpers on the same origin as its pinned runtime. */
export function wheelRuntimeOptions(moduleUrl) {
  return {
    renderMode: 'continuous',
    htmlContentMode: 'none',
    renderer: 'webgpu',
    wasmPath: new URL('./vendor', moduleUrl).href,
  };
}
