# StarButton

Toggle for starring a resource or project (`.starbtn`), showing the current count.

Static rendition of `StarButton({ kind, id, initialStars, onChange })` in `ui.tsx`. The consumer supplies `kind` ('resource' | 'project'), `id` and `initialStars`; `onChange` receives the new count.

- Off: ☆ in `muted` with `border-strong`; on: ★ in `gold` on `gold-dim` with `gold-line`.
- `big` for detail pages (8×16px, 15px). Disabled while a toggle is in flight.
