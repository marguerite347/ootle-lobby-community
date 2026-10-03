# MediaCard

Game-like tile (`.mcard`) with a 16:9 media area on top and a compact body, used in reels and starter grids.

Static rendition of `MediaCard({ r })` in `media.tsx`. The consumer supplies real cover art, a poster or a muted clip; without art, the `.media-ph.media-shader` placeholder shows the ecosystem glyph and title over a slow shader-like field in the item's own hue, with a shimmer — never a fabricated screenshot.

This shader is the chosen fallback cover, preferred over the loot-ticket treatment, for resources and projects alike. Its drift and shimmer stop under reduced motion and with effects off.

- Media gets a bottom scrim and optional `.media-badges` (top-left) and `.media-pop` (top-right).
- Hover lifts 3px with an `accent-strong` border. Ken Burns and shimmer stop under reduced motion.
- In `.reel` tracks each tile is 300px wide.
