# Button

Pill-shaped action (`.btn`); `primary` is the lavender gradient for the one thing a view is for.

Static rendition of `.btn` from `styles.css`/`HubMotion.css`. The consumer supplies a `<button>` or `<a>` with class `btn`, plus `primary` and/or `small`.

- **Primary** (`btn primary`): lavender gradient (`accent` → `accent-strong`), `on-accent` text, `shadow-primary`, min 44px tall. At most one per view. Expressive labels pair with a plain explanation nearby ("Send it" beside "Publish your project").
- **Secondary** (`btn`): `bg-elev` fill, `border-strong` outline, `text`; border goes `accent-strong` on hover.
- **Small** (`btn small`): 7×13px padding, 13px text, for inline rows.
- Press compresses to `scale(.96)`; disabled is 50% opacity with `not-allowed`.
- Label style `button` (14px/600), sentence case, verb first.
