# ContestPodium

Council monthly contest block: heading, entry status pill and a 1st/2nd/3rd prize podium.

Static rendition of `components/MonthlyContest.tsx`. No props: it reads the `MONTHLY_CONTEST` constant and `contestOpen()`. The consumer keeps prize amounts, currency and deadline exactly as the contest rules publish them.

- Section on `#14131e` with a faint lime corner glow and lime-tinted border, radius 24px.
- The first-place tile is solid `tari-green` with ink text, taller than the others; 2nd and 3rd sit on `#211b34`. Oversized rank numerals watermark each tile.
- The status pill states the real phase (ENTRIES OPEN / CLOSED). Under 650px the podium stacks.
