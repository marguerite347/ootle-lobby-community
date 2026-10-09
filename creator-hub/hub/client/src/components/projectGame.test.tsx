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
  it('keeps arbitrary saved code out of the public document', () => {
    const html = renderToStaticMarkup(<ProjectGame game={{ entry: 'index.html', files: { 'index.html': '<p>hi</p>', 'extra.js': '' } }} />);
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('<p>hi</p>');
    expect(html).toContain('run it in your local development environment');
    expect(html).not.toContain('allow-same-origin');
    expect(html).toContain('1 other saved file');
  });
});
