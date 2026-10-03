import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProjectGame, { savedGame } from './ProjectGame';

describe('savedGame', () => {
  it('accepts a saved single-file game and defaults the entry', () => {
    expect(savedGame({ files: { 'index.html': '<canvas></canvas>' } })?.entry).toBe('index.html');
  });
  it('rejects missing, empty or mismatched games', () => {
    expect(savedGame(null)).toBeNull();
    expect(savedGame({ files: {} })).toBeNull();
    expect(savedGame({ entry: 'main.html', files: { 'index.html': 'x' } })).toBeNull();
    expect(savedGame({ files: { 'index.html': 42 } })).toBeNull();
  });
});

describe('ProjectGame', () => {
  it('plays the entry in a sandbox without same-origin access', () => {
    const html = renderToStaticMarkup(<ProjectGame game={{ entry: 'index.html', files: { 'index.html': '<p>hi</p>', 'extra.js': '' } }} />);
    expect(html).toContain('sandbox="allow-scripts allow-pointer-lock"');
    expect(html).not.toContain('allow-same-origin');
    expect(html).toContain('1 other saved file');
  });
});
