# Tari video templates (Remotion + optional ComfyUI)

Deterministic, brand-controlled short-form video for Ootle Lobby. Remotion renders the Tari palette, Poppins typography, animated text and end cards in three social sizes; an optional, unvalidated [ComfyUI workflow](comfyui/README.md) generates background/concept imagery that Remotion composes the brand over. This is the concrete implementation surface for the [Capture & Promote plan](../VIDEO_WORKFLOWS.md) and rendering ticket [CH-028 (#56)](https://github.com/marguerite347/tari-growth/issues/56).

> Prototype tooling, not a hosted service. Remotion has a **company-license** requirement that must be confirmed for the intended operator and hosted use before this is run as a service. A render never implies permission to post.

Palette and type follow the [Ootle Lobby Design System](../design-system/README.md). `src/brand.mjs` must keep the design system's `tari-*` token values; change both together.

## Discover album artwork

The `AlbumArt` composition has 157 individually authored vector motion scenes for the current Discover catalog. Each scene has a separate subject, composition and motion brief. Follow [ALBUM_ART.md](ALBUM_ART.md) to render, visually review and install the four-second loops. These gallery illustrations use the Tari palette and a system-sans caption, and are separate from the reusable social-video templates below. Neither ComfyUI nor a paid generation API is required for this artwork.

## Three reusable templates

| Composition | Use | Key props |
| --- | --- | --- |
| `AppSpotlight` | An app: real footage/generated bg, three benefits, a "Try it" link. | `appName`, `tagline`, `benefits[≤3]`, `ctaLabel` |
| `TemplateWalkthrough` | Demonstrate a Tari component and invite a Riff. | `componentName`, `whatItDoes`, `steps[≤4]`, `remixLabel` |
| `CommunityUpdate` | New projects, contributor highlights, achievements. | `headline`, `items[≤4]`, `ctaLabel` |

Every template shares: `format` (`9:16` / `16:9` / `1:1`), `accent`, `durationInSeconds`, a `background` layer (`brand` gradient, or a ComfyUI `image`/`video` behind a scrim), and a `meta` block of tracking IDs. Props are validated data (`src/schemas.mjs`), never executed code.

## Use it

```bash
npm ci

# Interactive editor
npm run preview

# Render a template to any size + write an export manifest with tracking IDs
node scripts/render.mjs AppSpotlight props/app-spotlight.json out/app-spotlight.mp4
node scripts/render.mjs TemplateWalkthrough props/template-walkthrough.json out/tw.mp4
node scripts/render.mjs CommunityUpdate props/community-update.json out/cu.mp4

npm test   # validates every shipped props fixture against its schema
```

`format` sets the output dimensions and `durationInSeconds` sets the length (via `calculateMetadata`), so one composition covers TikTok/Shorts (9:16), landscape (16:9) and square (1:1).

## Export manifest (tracking carry-through)

Each render writes `<out>.mp4.manifest.json` retaining `projectId` / `templateId` / `campaignId` / `clipId` / `revision` and the tracked `destinationUrl`, plus an input hash and pinned tool versions — so a clip can be tied to visits and later creator actions (see [`../VIDEO_WORKFLOWS.md`](../VIDEO_WORKFLOWS.md) contracts and [`METRICS.md`](../../METRICS.md)). Large media stays out of Git (`out/` is ignored); the manifest is the small reviewable record.

## Generated backgrounds

Set `background.type` to `image` or `video` and point `src` at a file under `public/` (local media only; remote inputs require a future ingestion adapter). Generate that file with the self-hostable [ComfyUI workflow](comfyui/README.md) or the external-provider [`scripts/generate-hf.mjs`](scripts/generate-hf.mjs). Generated visuals must keep `background.kind: "concept"` so the on-screen badge distinguishes them from gameplay. The included `props/app-spotlight-bg.json` demonstrates the image-background path with a **non-AI placeholder** (`public/placeholder-bg.png`).

## Brand + typography

Public palette only (Cloud `#ECEEFF`, Ink `#040723`, Purple `#813BF5`, Green `#C9EB00`), from the marketing plan. The current footer is text-only Tari identification, not the official logo asset. The kit's display face is **Druk** (proprietary, not bundled); rendering uses **Poppins** (OFL) so this is redistributable. Swap in a licensed Druk build locally if your operator has it.

## Layout

```
src/
  brand.mjs            public brand tokens
  format.mjs           social sizes + fps
  schemas.mjs          zod prop contracts (3 templates + shared meta/background)
  components/base.tsx  Background (brand/image/video), Logo, KindBadge, CtaCard
  compositions/        AppSpotlight, TemplateWalkthrough, CommunityUpdate
  Root.tsx, index.ts   composition registry
props/                 sample inputs per template
scripts/               render.mjs (render + manifest), generate-hf.mjs (external provider)
comfyui/               shared self-hostable generation workflow + pinned versions
test/                  schema validation
```

## Where the other tools fit

Per the [resource inventory](../resources/video-production.md): **OpenMontage** (agentic brief → script/shot-list) and **MoneyPrinterTurbo** (narrated shorts) are follow-on recipe/adapter candidates layered after this pipeline; **Open Generative AI** is one external-provider option alongside ComfyUI. Remotion is executable local tooling. The ComfyUI SDXL still-image graph is an unvalidated API recipe, not a tested video generator or an importable editor workflow.

## Scope and review handoff

This increment does not complete CH-028: timed captions/SRT, audio, trim/crop editing, thumbnails, a durable job queue, progress/cancel/retry, idempotency and the in-hub interface remain follow-ups. Current text overlays are not a transcription/subtitle track. Local rendering is not a deployed service.

The render wrapper accepts props/output paths relative to the caller, resolves the installed CLI and composition from this package, renders a validated temporary props snapshot, and refuses an existing output/manifest. Use a new filename per clip revision. Media inputs must be files under public/; there is no remote fetch/asset authorization layer yet. Copy authorized assets there first. Fonts currently load from Google Fonts, so rendering needs network access for them.

Optional HF generation accepts HF_TOKEN or HUGGINGFACE_TOKEN. Pass --allow-paid for one potentially billed attempt; no automatic retry or cost ceiling is claimed. Hosted model revision is unknown and recorded as null; the image hash identifies the actual output. No token is shared with other creators. Keep generated media under public/generated/ or out/.

See [review handoff](REVIEW_NOTES.md) for changes and the remaining implementation boundaries. Licensing notes are informational for this internal prototype, not a code-push gate or an assertion that private use is exempt.

Set REMOTION_BROWSER_EXECUTABLE to an installed Chrome executable to avoid the automatic browser download. Sample copy is illustrative; replace it with verified project claims before publishing.

### Project motion covers

`AppCover` uses editorial illustrations for the five current uncaptured projects: private ballots, event tickets, marketplace exchange, agent payment routing and composable building blocks. These are generated promotional concepts, not app UI or verified functionality. The palette comes from `src/brand.mjs` (marketing plan v2 public tokens); Poppins is the bundled typography path, and no third-party project logo is invented. Existing optional accent overrides remain supported.

`node scripts/render-covers.mjs` now defaults to 16:9 to fit hub cards without cropping square titles. Landscape covers use a split title/art composition; square and portrait use stacked composition. Scenes use deterministic periodic motion so the loop joins cleanly. To add an editorial concept, extend the name-to-concept mapping in `src/compositions/AppCover.tsx` using verified catalog descriptions. Unknown projects receive the composable-block illustration with their own title/category.

After rendering, run `node scripts/prepare-previews.mjs` from `creator-hub/hub`. Successful webpage captures keep priority. Inspect a still and playback for each changed scene; regenerate the corresponding committed `hub/data/seed/previews/*.poster.png` thumbnails for fresh checkouts. MP4s remain runtime-only. The existing `npm run previews` pipeline calls this renderer, so future batch renders use the current artwork automatically; it is not a scheduled job.
