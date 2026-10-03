import {strToU8, zipSync} from 'fflate';

export function skillBundleArchive(files: Record<string, string>): Uint8Array {
  const entries = Object.entries(files).map(([name, content]) => {
    if (!name || name.startsWith('/') || name.includes('\\') || name.split('/').some(part => !part || part === '..' || part === '.') || typeof content !== 'string') {
      throw new Error('Invalid skill bundle file');
    }
    return [name, strToU8(content)] as const;
  });
  if (!entries.length) throw new Error('Empty skill bundle');
  return zipSync(Object.fromEntries(entries));
}
