# JournalCard

Creator Journal article card with inline SVG art on top; the first card in the grid is the wide featured one.

Static rendition of the cards in `pages/Blog.tsx` with `components/JournalArt.tsx`. The consumer supplies the article (`slug`, `title`, `description`, `category`, `art`, `publishedAt`) and the art variant (`loop`, `remix`, else toolkit).

- Card on `#14121e`, radius 24px; hover lifts 5px with a lavender border. Kicker is 10px caps lavender; the footer's read link is lime.
- Art is flat brand shapes on `tari-ink` (purple rings, lime accents, cloud glyphs), never stock photos. The orbit and float motions stop under reduced motion and effects off.
