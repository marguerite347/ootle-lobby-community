# CreatorArena

Community download leaderboard: a champion card over a ranked roster, with a week/all-time toggle and a join action.

Static rendition of `components/CreatorLeaderboard.tsx`. The consumer supplies `creators`, `listings` (with `downloads` and `weeklyDownloads`), loading and failed flags, and `onJoin`. Sample names and numbers here are placeholders.

- Card on `#14101f` with a purple glow, radius 22px. Heading "Creator *Arena.*" with the second word in lime (`#d4f56e`).
- Champion in a lime-edged tile with the ♛ crown; ranks 1–3 are tinted lime, sky and pink by number, not only colour. Score bars are 3px lavender.
- Rank only by real counts from the listing data. With no data, show the empty podium ("#01 · UNCLAIMED"), never invented creators.
- Reduced motion stops the emblem float and row slide.
