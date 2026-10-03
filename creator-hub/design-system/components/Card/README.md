# Card

Resource card (`.card`): raised `bg-elev` surface with badges, title, clamped summary and a meta footer.

Static rendition of `ResourceCard` in `ui.tsx`. The consumer supplies the badges row (`.top`), an `h3`, a `.summary` (clamped to 3 lines) and a `.foot` of meta and links. Media can lead as `.media:first-child`, bleeding to the card edges.

- `radius`, `border`, padding `space-card`; hover raises the border to `border-strong`, and a card containing a link lifts with `shadow-card-hover`.
- Lay out in `.grid` (3-up) or `.grid.two`; collapses to one column under 900px.
