# Reuse-first gaming presentation research

Checked September 22, 2026. GitHub metadata and primary project descriptions were inspected; individual components are candidates until built and tested. Source lists already in the repo are reused. Dedicated licensing review is deferred per user direction; preserve source links and revision metadata without claiming blanket clearance.

| Resource | Intended reuse | Revision | Last commit | Archived |
| --- | --- | --- | --- | --- |
| [React Bits](https://github.com/DavidHDev/react-bits) | Select spotlight cards and an art-led hero example; inspect individual dependencies. | `c5df8610c0b4` | 2026-09-22 | False |
| [Motion](https://github.com/motiondivision/motion) | Use lazy-loaded motion features for reveal/layout transitions; preserve reduced motion. | `823947dcc170` | 2026-09-22 | False |
| [Awesome React Three Fiber](https://github.com/gsimone/awesome-react-three-fiber) | Find a coherent showcase scene instead of writing scene infrastructure. | `f70b03df9885` | 2021-02-19 | False |
| [Drei](https://github.com/pmndrs/drei) | Reuse model staging, environments and camera controls in optional 3D recipes. | `1397c37cbdf2` | 2026-09-21 | False |
| [pmndrs UIKit](https://github.com/pmndrs/uikit) | Optional in-game spatial UI; preserve DOM navigation and forms. | `2aaf8aba2e5d` | 2026-09-01 | False |
| [Rive React runtime](https://github.com/rive-app/rive-react) | Optional animated badges/characters with input-state bindings. | `c5470664406d` | 2026-09-16 | False |
| [Canvas Confetti](https://github.com/catdad/canvas-confetti) | Bounded celebration at confirmed publish or achievement events. | `20eebad51dde` | 2025-10-25 | False |
| [Pixi particle emitter](https://github.com/pixijs-userland/particle-emitter) | Evaluate exact Pixi version compatibility; older editor formats need conversion. | `0fffdd9d18ca` | 2026-01-09 | False |
| [Awesome Gamedev](https://github.com/Calinou/awesome-gamedev) | Discovery source, not a tested bundle or an activity guarantee. | `9918eea4f16a` | 2026-08-25 | False |
| [Design Resources for Developers](https://github.com/bradtraversy/design-resources-for-developers) | Find typography, UI kits and source assets for coherent themed presets. | `e71627409ec9` | 2026-05-24 | False |

[Kenney UI Pack](https://kenney.nl/assets/ui-pack) supplies assets; [Websitevice gaming examples](https://websitevice.com/gaming-examples) supplies visual references. Neither a source listing nor a recent commit establishes compatibility or production readiness.

## Implementation decisions

- First slice reuses the existing ProjectCover, PublishedShelf, ChallengeShelf and CreatorLeaderboard components. Adopt Motion 13.4.1, whose published peer range supports the hub’s React 18, for reduced-motion-aware entrance animation.
- React Bits: select individual examples during kit work, do not import its entire gallery.
- R3F/Drei/UIKit: optional 3D showcase recipe; avoid making ordinary catalog browsing depend on WebGL.
- Pixi particle emitter: upstream documents older Pixi compatibility; test before adoption rather than installing against the newest Pixi blindly.
- Rive is a runtime candidate; a runtime alone does not supply authored character animations.
- Reuse code and assets, then theme them coherently. Bespoke per-project covers remain required; a reused renderer is not permission to repeat the same art.

## Backlog ownership

GitHub is authoritative. Existing #41 owns asset discovery, #28 creator discovery, #58 playback, #80 challenges, #25/#59/#108 analytics. New visual tickets specify cross-page integration and quality; they do not replace those scopes. See the linked epic for order and dependencies.

## First implementation and handoff

2026-09-22: the homepage now leads with the existing published-project component and actual gameplay video. Clear create/release actions precede community challenges; resource search follows. Motion 13.4.1 drives a one-time challenge entrance and respects reduced motion. It is bundled with the client, not fetched from a third-party runtime. The production build is 452.01 kB JS, 142.75 kB gzip; further animation additions must account for that cost.

Validated: TypeScript/Vite production build and all 30 client tests. Browser screenshots inspected at 1440px desktop and 390px mobile; mobile document width equals viewport width. Featured video had readyState 4, paused false and advancing playback. Browser reduced-motion mode pauses automatic cover playback.

Resource ingestion indexed 28 creator references, 12 more than the previous inventory, using the existing creator-references connector. This adds discoverable references, not preinstalled versions of every tool. The production deployment remains separate from this local preview.

Continue through [the epic](https://github.com/marguerite347/tari-growth/issues/110): #111 kit specimens, #112 remaining homepage state/performance checks, then #113 discovery and #114 creation. This is partial progress on existing #28/#41/#58, not closure of those broader tickets. Creator Arena is currently on Skills; embedding it on the homepage remains in the visual backlog. No new payout mechanism or analytics service was claimed or enabled.
