# PopularityChip

Compact popularity indicator (`.pop`) — tier colour, score and the strongest native metric — that links to the popularity explainer.

Static rendition of `PopularityChip({ p, compact })` in `ui.tsx`. The consumer supplies a `Popularity` (`score`, `tier`, `tierLabel`, `confidence`, `sources`, `native.metric`); `compact` hides the native metric. A null score renders the `new` tier with ✦ and "New".

- Tiers: `pop-top` (`gold` on `gold-dim`), `pop-popular` (`native`), `pop-emerging` (`accent`), `pop-new` (`faint`).
- Always carries a `title` explaining the score and its sources; never show a score without them.
