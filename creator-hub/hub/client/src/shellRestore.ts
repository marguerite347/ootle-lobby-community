// A restored read-only page may retain a shell from before a local delivery.
const BROWSE_ROUTES = new Set(['/games', '/explore', '/learn', '/skills']);
export function entryAsset(html: string): string | null {
  for (const tag of html.match(/<script\b[^>]*>/gi) || []) {
    if (!/\btype\s*=\s*["']module["']/i.test(tag)) continue;
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (src && /^\/assets\/index-[\w-]+\.js$/.test(src)) return src;
  }
  return null;
}
export function safeRestore(pathname: string, interacted: boolean, activeSurface: boolean): boolean {
  return BROWSE_ROUTES.has(pathname) && !interacted && !activeSurface;
}
export async function checkRestoredShell(current: string | null, safe: () => boolean, read: () => Promise<string>, reload: () => void) {
  if (!current || !safe()) return;
  try {
    const latest = entryAsset(await read());
    // Recheck after I/O: the user may have begun typing or opened chat meanwhile.
    if (latest && latest !== current && safe()) reload();
  } catch { /* Offline restores remain usable. */ }
}
export function installShellRestore() {
  const current = entryAsset(document.documentElement.outerHTML);
  let interacted = false;
  const remember = () => { interacted = true; };
  document.addEventListener('input', remember, true);
  document.addEventListener('change', remember, true);
  const activeSurface = () => Boolean(document.querySelector('.chat-sidebar:not([hidden]), dialog[open], [contenteditable="true"], iframe'));
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    void checkRestoredShell(current,
      () => safeRestore(location.pathname, interacted, activeSurface()),
      async () => {
        const response = await fetch('/', {cache: 'no-store', headers: {'Accept': 'text/html'}});
        if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('No shell response');
        return response.text();
      }, () => location.reload());
  });
}
