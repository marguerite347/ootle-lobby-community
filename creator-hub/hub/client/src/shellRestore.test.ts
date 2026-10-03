import {describe, expect, it, vi} from 'vitest';
import {entryAsset, safeRestore, checkRestoredShell} from './shellRestore';
const html = (hash: string) => `<script type="module" crossorigin src="/assets/index-${hash}.js"></script>`;
describe('restored shell delivery', () => {
  it('identifies only a production entry, never development or unrelated scripts', () => {
    expect(entryAsset(html('abc-123'))).toBe('/assets/index-abc-123.js');
    expect(entryAsset('<script src="/assets/index-old.js"></script>')).toBeNull();
    expect(entryAsset('<script type="module" src="/src/main.tsx"></script>')).toBeNull();
  });
  it('excludes editors, reward play, chat and interacted pages', () => {
    for (const route of ['/', '/studio', '/project/example', '/create', '/games/example/']) expect(safeRestore(route, false, false)).toBe(false);
    expect(safeRestore('/games', false, false)).toBe(true);
    expect(safeRestore('/games', true, false)).toBe(false);
    expect(safeRestore('/games', false, true)).toBe(false);
  });
  it('reloads a safe restored page only when the entry actually changed', async () => {
    const reload = vi.fn();
    await checkRestoredShell('/assets/index-old.js', () => true, async () => html('old'), reload);
    expect(reload).not.toHaveBeenCalled();
    await checkRestoredShell('/assets/index-old.js', () => true, async () => html('new'), reload);
    expect(reload).toHaveBeenCalledOnce();
  });
  it('preserves state if the user starts work during fetch or the fetch fails', async () => {
    const reload = vi.fn(); let safe = true;
    await checkRestoredShell('/assets/index-old.js', () => safe, async () => {safe = false; return html('new');}, reload);
    await checkRestoredShell('/assets/index-old.js', () => true, async () => {throw new Error('offline');}, reload);
    expect(reload).not.toHaveBeenCalled();
  });
});
