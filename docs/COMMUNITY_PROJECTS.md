# Community Projects

Non-contest projects shared on a forum, GitHub or another public creator page can appear in the Lobby. Add one reviewed JSON file per project in `content/community-projects/`; use the existing records as examples. The files are public, validated in CI, published through the existing GitHub Pages content feed, and bundled into the Vercel app as an outage/older-feed fallback. This is separate from the still-disconnected Workbench publication backend (WB-FEED/WB-PUBLISH).

## Review a listing

1. Link the creator's own post or repository using `sourceUrl` and an accurate `sourceLabel`. Keep third-party forum discussion separate. Never attribute someone else's announcement to the creator.
2. Record the supported publication date with a visible `publicationLabel` and source explanation in `publicationBasis` and date evidence link in `publicationUrl`. GitHub repository creation is not proof of the first public release; the liquidity record explicitly labels it as repository creation; the miner record uses its sourced forum announcement date. Do not substitute the date the Lobby added the card.
3. Describe what the public source supports, including material prototype/testnet limitations. Do not infer production readiness from source code or screenshots.
4. Add only source-verified Tari components or project templates, preferably linking to a pinned commit and actual implementation. An L1 miner should not be marked as an Ootle template app. Use an empty technology array if unverified.
5. For forum counts, a dedicated project topic uses `scope: "topic"`; a post in a shared thread uses `scope: "replies"`. The latter counts only its descendant replies. If there is no verified project-specific discussion, set `forum: null`; the card shows an unknown count, not zero.
6. Check September and October registries for duplicates. `npm run validate` rejects known contest repository duplicates. A reviewed contest entry belongs in its contest rather than both sections.
7. Add a real reviewed recording and poster to `creator-hub/hub/data/seed/previews/community/`, or set `media: null` until one exists. Include the source URL, capture/review timestamps, SHA-256 and an honest visible label. A repository walkthrough is not a working-app demonstration. Preserve attribution and applicable upstream notices when reusing creator media.
8. Run `npm test`, `npm run validate`, the server content/metrics tests and the production site build. Review desktop/mobile composition and saved video playback. Submit a PR. Accepted main content publishes through the existing workflow; site-code changes additionally need the normal Vercel deployment.

The gallery sorts by publication date. `/api/community-projects/metrics` reads allowlisted GitHub repository URLs from validated content and the complete Discourse post stream. It keeps separate GitHub push dates, stars, comment counts and checked-at timestamps, retaining last verified values during failure. It caches daily per warm server instance; a globally coordinated durable daily cache remains flagged as COMMUNITY-METRICS. This does not alter the once-daily October monitor or its dedicated channel.

## Initial reviewed sources — 2026-10-04

- [Tari/Ootle Liquidity Protocol](https://github.com/GSXRspartan/tari-ootle-liquidity-protocol): GSXRspartan; GitHub repository created September 24. Reviewed revision `5118e9550c9a461c47b6b1db4da1922f3501784b`. Includes fungible-pool and NFT-marketplace templates, Tari Template Library and the browser Tari provider adapter. The README calls its interface screenshots deterministic test fixtures and reports no live protocol deployment. No matching project-specific forum thread was verified; unrelated swap-project comments are not reused.
- [TARI.Miner](https://github.com/JustAResearcher/TARI.Miner): JustAResearcher / Meowmancer; GitHub repository created July 19. Reviewed revision `ae4446853edd191b01221be12b26f46854ba979c`. Cuckaroo29 proof code and CUDA solver are visible in source. [Forum discussion](https://community.tari.com/t/open-source-c29-gpu-miner-for-tari-universe/210) was posted by kinkajou on July 20, not the creator; it is labeled as discussion. No GPU mining operation was performed.

## Capture selection receipt and review

Reused the existing September `ResourceCardMedia`, metric badges, component labels, card CSS and public content publishing workflow. Reused the installed `creator-hub-demo-capture` skill's source/framing/playback checks. The existing capture CLI is catalogued in `creator-hub/capture`; it was not run because this session required the selected Chrome extension instance. That instance exposes CDP screencast capture, tested with a short representative recording before both covers.

Both clips are actual browser screencasts of the public repository README at 1280 × 800, scrolling from the project overview into the creator's documentation/screenshots. Frames came from `Page.startScreencast` / `Page.screencastFrame`, were acknowledged and encoded with their recorded timestamps using ffmpeg, H.264/yuv420p, 24 fps, faststart. A 904 × 752 content crop excludes GitHub account/navigation controls. Raw frames and scratch files remain outside the repository. No source application was installed, wallet connected or transaction submitted.

| File | Duration | Content | Review |
| --- | --- | --- | --- |
| `liquidity.mp4` | 11.875 s | README, testnet notice and creator-supplied interface screenshots | Opening/middle/closing decoded frames and browser playback |
| `miner.mp4` | 8.875 s | README overview, release/platform instructions | Opening/middle/closing decoded frames and browser playback |

These are deliberately labeled repository walkthroughs. Creators can propose replacement app demos through the same reviewed content workflow.

## Explore showcase audit — 2026-10-04

One `ProjectCard` renders September, October, reviewed community/official records and future Workbench publications. The title anchor covers the card's empty space, cover and text; separate anchors/buttons retain their own targets and keyboard focus. GitHub star badges open the repository root, never `/stargazers`. All 13 GitHub-backed September entry URLs returned HTTP 200 during this audit (Threshold's two entries share a repository). WunschSwap uses Disroot and has no fabricated GitHub count.

`section: "official"` requires an official Tari website citation plus a `tari-project` repository. Official Tari Projects appears below Community Projects. The official Universe miner is `tari-project/universe`; the similarly named community web wallet at `universe.tari.mw` remains the September Tari L1 Web Wallet, not an official miner entry.

Reviewed additions:

| Explore record | Lobby placement | Source / limitation |
|---|---|---|
| SOOON FUN | Community | Directory topic 281, post 1; shared listing is not a creator-authored announcement; no verified public repository or project-only reply count. |
| LabyrinthOS | Community | Directory topic 281, post 1; current runtime availability unverified; no verified public repository or project-only reply count. |
| Tari Agent Pay | Community | Creator announcement in topic 281, post 9; repository README documents `ootle_sdk_core` and Ootle WASM; runtime unverified. |
| Tari Ootle Playground | Community | Community resource by luci666, topic 281 post 5; distinct from official Ootle documentation. |
| Tari Market | Community | Public wiki last-modified date, not invented launch date. Old `johnnysessa/Tari-Market` repository returned 404; app requires ChatGPT sign-in. Keep GitHub count unknown and omit its broken link. |
| Tari Universe desktop | Official | `tari.com/downloads` and `tari-project/universe`; not the community wallet. |
| Ootle WASM Templates | Official | `tari-project/wasm-template` and official guessing-game guide. Shown as one official template collection; individual starter covers are not replaced with an unrelated example. |

Existing Caravel/Caravel Labs, Sapient, community Universe wallet, TariOrg and ShadowTix listings already correspond to September cards; do not duplicate them in Community. Existing Liquidity Protocol and TARI.Miner remain. Learning guides remain in Learn rather than being passed off as additional apps.

### Media selection receipt

Reuse: existing ResourceCardMedia playback, ProjectTechnology labels, full Discourse-stream metrics and the tested Chrome CDP screencast → FFmpeg H.264 workflow. No new dependencies. The trial recorded the public SOOON directory entry; seven 8-second public-page/source walkthroughs were encoded and opening/middle/end frames decoded for review. Forum/GitHub account navigation is cropped out. No wallet was unlocked and no app transaction was performed. SOOON, LabyrinthOS, Playground and Market posters are crops of the project screenshots published in their source pages; clips remain honestly labelled public source walkthroughs. Wiki source material retains CC BY-SA 4.0 attribution via the linked source; all creator attribution is retained in records.

Remaining gaps: Workbench's backend publication feed remains disconnected and must supply reviewed media/component provenance; global once-daily metric caching still needs durable coordination. Unknown counts stay unknown. October's existing three teaser cards remain until real reviewed submissions arrive; new entries automatically get the shared card without further layout work.
