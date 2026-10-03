# Badge

Small pill label for ecosystem, readiness, verification and freshness (`.badge`), with a flat `.tag` for keywords.

Static rendition of `EcosystemBadge`, `ReadinessBadge`, `VerificationBadge`, `FreshnessBadge` and `TariCompatBadge` from `ui.tsx`. The consumer supplies the label text; the class picks the tone.

- `badge native` — Tari-native (`native` on `native-dim`), e.g. "Tari Ootle", "Ootle app".
- `badge ext` — other ecosystems (`accent` on `accent-dim`).
- `badge` — neutral (`muted` on `bg-elev-2`): readiness, verification, "Not Ootle".
- `badge dot fresh-current|fresh-stale|fresh-failed` — freshness in `native`/`warn`/`danger`; the dot inherits the text colour. Always keep the word; colour is never the only signal.
- `tag` — keyword chip in `faint` on `bg-elev-2`, `radius-tag`.
