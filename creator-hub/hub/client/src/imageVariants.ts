import manifest from './imageVariants.json';

type Variant = {src: string; width: number};
const variants: Record<string, Variant[]> = manifest;
const siteHosts = new Set(['lobby.tari.com', 'ootle-lobby-preview.vercel.app']);

/** Only rewrite reviewed, locally bundled media; unrelated sources stay intact. */
export function webImage(source: string) {
  let path = source;
  if (!source.startsWith('/')) {
    try {
      const url = new URL(source);
      if (url.protocol !== 'https:' || !siteHosts.has(url.hostname) || url.search || url.hash) return {src: source};
      path = url.pathname;
    } catch { return {src: source}; }
  }
  const available = variants[path];
  if (!available) return {src: source};
  return {
    src: available[available.length - 1].src,
    srcSet: available.map(item => `${item.src} ${item.width}w`).join(', '),
    sizes: '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 400px',
  };
}
