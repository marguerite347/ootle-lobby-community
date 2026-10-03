# Capture & Promote: creator video workflows

Design proposal, 2026-09-19. This specifies future implementation, not an installed video editor, connected publisher or live analytics feed. GitHub CH issues linked below are the implementation backlog.

## Place in the creator experience

**Discover → Learn → Build with Tari templates → Test → Capture & Promote → Publish → Measure → Riff.** Capture & Promote is optional and belongs to a project, not a separate marketing dashboard that creators must configure before building.

| Entry point | Creator experience |
| --- | --- |
| Project workspace | A Capture & Promote tab beside build/test work. Record a runnable preview or upload existing footage. Preserve project revision and template versions. |
| Template detail | “Make a demo” recipe explaining what the template does, where it has been used, and a shot list showing the feature in a real project. No recording button for a configuration that cannot run. |
| Learn | Capture tutorials, captioning, brand assets, distribution recipes and interpreting results; links back to the relevant Tari/Ootle template and working examples. |
| Resource library | Searchable video tools by capture/edit/generation/render/publish role, license, setup, cost and engine compatibility. See [tool inventory](resources/video-production.md). |
| Project showcase / application | Opt-in clips on the project page and an embeddable player for release notes, onboarding or an in-game help panel. |

The shortest journey is **upload → trim → caption → export**. No social account, wallet, Meta Pixel or AI subscription is required. Advanced controls expand on demand.

1. **Choose a purpose:** show a Tari template working, explain a mechanic, announce an update, teach a step, or share a player highlight. Choose the destination and call to action: play, learn, Riff or build.
2. **Capture:** explicit screen/tab recording or upload from any engine/device. Optional game SDK marks interesting moments with timestamps; it does not record in the background. Explain audio support and offer upload when browser capture is unsupported. Stop recording when the user stops sharing. Preview before saving.
3. **Compose:** select a moment, trim, crop with adjustable focal point, edit captions/transcript and choose a reusable layout. Offer 9:16, 1:1 and 16:9 variants, with destination-specific capability validation. Keep originals unchanged.
4. **Brand and check:** versioned logo/font/color/end-card presets, creator attribution and links to the original project/template. Reference the [marketing v2 document](https://docs.google.com/document/d/14aIbM0Zga_8KSzlka_6UOUwuSuc3_WZp6yE7DxwQjok/edit) for current guidance and its linked assets. Extract only approved public guidance into presets; do not ship the private document. There is no separate established BRAND_VOICE.md. Check captions, facts, music/asset rights and confidential UI in the preview. Generated concept visuals must be distinguishable from recorded gameplay.
5. **Deliver:** download video + thumbnail + captions + suggested copy + tracked destination link, or use an explicitly connected publishing account. Show which identity and destination will publish, preview the exact payload and let the creator schedule or publish. A render never implies permission to post. Export remains available when an API is unsupported or access expires.
6. **Learn from results:** show views and completion where available, qualified visits and downstream play/build/remix activations. Recommend the next experiment without promising reach. Keep organic performance separate from paid campaigns.

## Wiring and storage

These paths are proposed additions under the existing [hub application](hub/README.md), not modules already implemented.

| Location | Responsibility |
| --- | --- |
| `creator-hub/resources/video-production.md` | Verified upstream sources and learning recipes; feed the existing catalog ingestion approach rather than fork entire tools into this repository. |
| `creator-hub/hub/client/` | Project Capture & Promote UI, preview, export, account capability and per-project results views. Follow existing routing conventions. |
| `creator-hub/hub/server/media/` | Project-scoped authorization, media metadata, upload intents, signed reads and deletion. |
| `creator-hub/hub/server/video/` | Clip revisions, render job API, publication records, provider adapters and webhooks. |
| `creator-hub/video-worker/` | Isolated asynchronous rendering, transcoding and optional generation adapters. Do not run long renders in an HTTP handler. |
| `creator-hub/video-templates/` | Versioned reviewed compositions, schemas, public brand presets and small licensed test fixtures. |
| `creator-hub/examples/capture/` | Browser example and optional PlayCanvas capture/moment recipe linked to CH-024/025; upload supports other engines without native SDK work. |
| Hosted object storage + application database | Originals, exports, transcripts, thumbnails and metadata; private by default. Raw media, credentials and private drafts never go in Git. |
| Existing metrics pipeline | Normalized observations with campaign/project/creative dimensions, source evidence, freshness and daily/WoW reporting. |

Media upload must validate MIME/content, size and duration; guard remote fetches, expire signed URLs, enforce quotas and support deletion of originals and derivatives. Before multi-user hosting, provide project-level authorization and tenant isolation. The current prototype is not evidence of production authentication.

### Minimal contracts

- **Media:** `media_id`, `project_id`, creator identity, source kind (`capture`, `upload`, `generated`), object key, checksum, duration, codecs, rights/provenance, visibility, retention/deletion timestamps.
- **Clip revision:** `clip_id`, revision, source media/time ranges, project revision, Tari template IDs/versions, video layout version, brand preset version, captions, locale, crop, CTA and campaign ID.
- **Render job:** immutable clip revision, output preset, adapter/version, job/idempotency key, estimated/actual cost, progress, output IDs and error. States: queued, running, succeeded, failed, cancelled. Retries must not double-charge or overwrite an approved export.
- **Publication:** output ID, destination/account reference, scheduled time with timezone, campaign/creative/post IDs, platform URL, idempotency key, permissions and state. States: draft, scheduled, publishing, published, failed, cancelled. On an uncertain provider response reconcile before retrying. Credentials stay in a secret store.
- **Placement:** approved output, project/page/app surface, caption/thumbnail, accessible playback and optional analytics settings. Unpublish/delete removes controlled placements; external copies may require separate removal.

A render adapter exposes capabilities, validate, estimate, submit, status, cancel and outputs. Start with ordinary recorded footage plus a deterministic branded composition. Evaluate Remotion for that renderer subject to its license. OpenMontage, Open Generative AI and MoneyPrinterTurbo are optional recipe/adapter candidates, not required services or silent fallback providers. Pin reviewed versions; isolate user inputs from executable composition code and agent instructions. Never run uploaded scripts or automatically install upstream agent skills.

**Status (first increment of CH-028):** a local prototype now exists at [`video-templates/`](video-templates/README.md) — a Remotion renderer with three reusable templates (App spotlight, Template walkthrough, Community update), any social size, and an export manifest carrying project/template/campaign/clip IDs and the tracked destination link. A shared, self-hostable [ComfyUI workflow](video-templates/comfyui/README.md) is wired alongside for background/concept generation, with the brand applied in Remotion so generated imagery cannot distort it. Remotion's company-license requirement still needs confirming before any hosted/operator use; large models and rendered media stay out of Git.

## Distribution and in-app playback

Reuse the scheduler selection in [DW-010](https://github.com/marguerite347/tari-growth/issues/10), rather than building competing social scheduling systems. Begin with export packages and one supported adapter selected from actual account access. Record each provider's formats, scopes, account requirements, rate limits and publishing/analytics support. Test expired credentials, duplicate webhook delivery, cancellation and failed posting. Do not label a connection usable until retrieval or publishing capability is validated.

For in-app use, deliver a lightweight player/manifest with posters, captions, lazy loading, mute controls and explicit play. Do not autoplay audio or interrupt gameplay by default. Cross-origin embedding needs an explicit origin policy and accessible fallback link. Capture from games and displaying a clip inside games are separate capabilities.

[Meta resources](META_ADS_KIT.md) remain optional. Creators use their own authorized advertising accounts and tracking settings. Social posting is distinct from buying ads; this project does not authorize ad spend or pool creator audiences.

## Analytics connection

Follow [METRICS.md](../METRICS.md), CH-005, DW-008, DW-011 and DW-015 through DW-017. Carry `project_id`, `campaign_id`, `clip_id`, clip revision and provider post ID across creation, distribution and reporting. Use a stable creative identifier in tagged links; preserve destination URLs and do not place personal information in tags.

| Layer | Measures and interpretation |
| --- | --- |
| Creator workflow | Capture/upload success, render completion/failure, time to first export, export-to-publication conversion. Funnel denominators use distinct eligible projects, not total button clicks. |
| Distribution | Provider-defined impressions, views, watch time/completion, engagements and link clicks, separated by platform/account and organic/paid. Different view definitions are not interchangeable. |
| Hub/app playback | Consented play, 25/50/75/100% progress and CTA clicks with event IDs and session rules. Never send wallet keys, private balances, screen contents or free-form transcripts as analytics. |
| Acquisition | Tagged relevant visits → first play → return play; or guide visit → template use → first successful test → published project. Universe installs and SDK activation require their own telemetry, not download or video-view inference. |
| Efficiency | Cost per qualified visit/activated creator where attributable, rendering cost per exported clip and campaign spend separately. Revenue attribution needs actual product events; do not infer it from views or token transfers. |

Store source metric definitions, reporting windows, source update time, fetch time and quality state. Show unavailable as unavailable, not zero. Use an explicit configurable attribution window and model; show unattributed activity honestly, avoid cross-device identity guesses and double-counted conversions. Collect provider data before the existing 7 AM EDT reporting deadline with the runbook's timezone policy. Late platform data remains provisional; backfill prior periods and retain revisions. Compare completed weeks plus clearly labeled week-to-date values. Deletion and opt-out must propagate through owned telemetry.

## Delivery sequence and handoff

1. Catalog/tutorials and shared contracts + project UX.
2. Capture/upload + storage, then branded render/export. This yields a useful workflow without connected social accounts.
3. Scheduler integration and embedded playback can proceed independently after approved exports exist.
4. Instrument each feature as it ships; connect provider observations and daily/WoW reporting when access exists.

Initial tutorial: record a working Ootle template interaction, produce a 20–30 second captioned explanation with a Learn/Remix CTA, export it, optionally place it on the project page, and inspect the first measured visits. This is educational product evidence, not a public announcement of unreleased games.

## Implementation tickets

GitHub is authoritative for progress, dependencies and acceptance checks.

- [CH-026: Define Capture & Promote project UX, contracts and learning resources](https://github.com/marguerite347/tari-growth/issues/54)
- [CH-027: Implement explicit gameplay capture, uploads and private media storage](https://github.com/marguerite347/tari-growth/issues/55)
- [CH-028: Build branded clip composition and asynchronous render/export](https://github.com/marguerite347/tari-growth/issues/56)
- [CH-029: Connect clip export to optional social scheduling and publishing](https://github.com/marguerite347/tari-growth/issues/57)
- [CH-030: Add approved clip playback to showcases and game/app surfaces](https://github.com/marguerite347/tari-growth/issues/58)
- [CH-031: Measure creative-to-activation funnels and daily/WoW video outcomes](https://github.com/marguerite347/tari-growth/issues/59)

## Audio resources

Use the [audio resource bucket](resources/audio.md) for music, sound effects, voice and optional whisper.cpp transcription. Preserve asset rights and attribution in clip exports; free hosted plans are not assumed commercially licensed.
