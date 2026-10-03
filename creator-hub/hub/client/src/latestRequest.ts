// A response may update the UI only while its input version is current.
export function latestRequest() {
  let version = 0;
  return {
    invalidate() { version++; },
    begin() { const requested = ++version; return () => requested === version; },
    snapshot() { const requested = version; return () => requested === version; },
  };
}
