import {describe, expect, it} from 'vitest';
import {webImage} from './imageVariants';

describe('reviewed image delivery', () => {
  it('uses the same bundled derivative for production and preview-domain posters', () => {
    const path = '/previews/community/resource-crypt-20261029.png';
    const image = webImage(path);
    expect(image.src).toMatch(/^\/previews\/optimized\/[a-f0-9]+-960\.webp$/);
    expect(image.srcSet).toContain('480w');
    expect(image.srcSet).toContain('960w');
    expect(webImage(`https://ootle-lobby-preview.vercel.app${path}`)).toEqual(image);
    expect(webImage(`https://lobby.tari.com${path}`)).toEqual(image);
  });
  it('preserves unknown, external and transformed images instead of inventing a derivative', () => {
    for (const source of ['/previews/new-project.png', 'https://example.org/previews/community/resource-crypt-20261029.png', 'https://lobby.tari.com/previews/community/resource-crypt-20261029.png?crop=1']) {
      expect(webImage(source)).toEqual({src: source});
    }
  });
});
