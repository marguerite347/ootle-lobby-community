# Community banner campaign artwork

The October 30 website update brings the community social campaigns into the existing two-event banner. It retains a single Discord link, **Add to calendar**, dismissal and the existing event/calendar lifecycle. Dates, times, venue and game choices remain HTML sourced from event configuration; artwork contains no event text. The November 1 lineup remains **R.E.P.O. or Shift At Midnight**, not a selected winner.

## Selection receipt

Reused the existing React banner, calendar serializer and responsive CSS, the game kit's text-free scared-turtle master, and the Customer.io-branded Tari Show campaign as the ghost reference. Reused the lobby sizzle reel's Anton font with its SIL Open Font License retained beside the font. No new runtime dependency, service or API was added.

The first built-site trial exposed text crossing the characters at narrow widths. Narrow layouts now constrain supporting text, reduce headline size and place the scenes farther right. The same narrow-panel treatment applies to tablet halves. The artwork is decorative; visible headings and event details remain accessible text. A single remaining event still uses the existing full-width layout.

Validation: the production site build and packaged-runtime check passed; all five banner lifecycle tests and four calendar tests passed. The rendered site was reviewed at 375, 414, 768, 1024 and 1440 pixels with loaded artwork and no horizontal overflow. The calendar dialog opens and closes and retains the existing Google, Apple and downloadable-feed links.

## Assets and provenance

- `creator-hub/hub/client/public/community/game-night-horror-scene.webp`: optimized from `Game-Night-2026-11-01-Artwork-only-master.png`, the existing game-night social kit. The scared lime turtle, haunted loot cart and gas-station setting represent the two options still under vote.
- `creator-hub/hub/client/public/community/tari-show-campaign-scene.webp`: built-in image-generator edit of `Tari-Show-2026-11-03-Landscape.png` from the corrected Customer.io-branded social kit. Milky-white ghost, navy/lime headphones, midnight navy and purple clouds.
- `creator-hub/hub/client/public/community/fonts/Anton.ttf`: unchanged font reused from the lobby reel. Its upstream `OFL.txt` is included in the same directory.

Both scene exports are 800 × 800 WebP at quality 85. Full-resolution masters and local browser acceptance images remain under ignored `work/community-banner-art/` and `work/community-event-socials/`.

## Ghost edit prompt

Built-in image generation, using the corrected landscape poster as the edit target:

> Use case: precise-object-edit. Asset type: square text-free website banner scene. Edit the attached approved Tari Show campaign poster. Remove ALL text, dates, logos, URLs and lettering. Preserve the EXACT white glossy friendly ghost character, its navy headphones with acid-lime ear pads and band, large black eyes, happy mouth, purple rim lighting, raised little arms, and midnight-navy starry atmosphere with fine orbital lines and purple clouds. Reframe as a square illustration containing the same ghost centered, fully visible from head to tail, occupying about 80% of height and 75% of width with its headphones intact. Keep some dark navy space around the silhouette, especially left, and purple clouds below. Maintain the original campaign's high quality 3D cartoon rendering and white/navy/lime palette. No new objects, no microphone, no lavender body, no text or logo anywhere.

## Maintenance

Follow `COMMUNITY_EVENT_MAINTENANCE.md`. Refresh game-specific scenery with a confirmed new lineup or session; use the neutral mascot if a matching scene is not ready. Do not embed dates or event copy in replacement art. Preserve the Customer.io ghost identity for future show scenes.
