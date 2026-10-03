# Resource-specific video previews

This rule applies to ALL gallery thumbnail generation, app captures, generated scenes, ComfyUI workflows, Remotion renderers, agent jobs and future integrations.

Brand framing (palette, type, end cards, fallback covers) comes from the [design system](design-system/README.md): use its tokens by name. This policy governs what a cover or capture may show.

## Required outcome: bespoke animated album covers

The user wants a uniquely generated animated album cover for EVERY Discover item: apps, games, templates, assets and educational resources. Each cover needs its own concept, composition, imagery and motion, designed around what that specific resource does or enables.

Creative illustration, metaphor, abstraction and feature storytelling are welcome. A cover DOES NOT need to reproduce the application's interface, layout, controls, palette or actual screenshots. Recording the UI is an option, not the preferred or required default. Learn the subject from its source, then art-direct original artwork about it. Never label illustration as actual gameplay or invent unsupported product capabilities.

No repeating finished clips, stock scenes, shared compositions or animation reskins. Changing the title, color, icon, random seed or arrangement does not make a reused concept unique. Tari typography, palette, brand framing and technical render infrastructure may unify the collection, but must not substitute for distinct subject-specific artwork.

A missing UI is not a blocker: illustrate the resource's purpose, mechanics or creative possibilities. Assess existing individually themed feature videos separately; do not reject all generated or abstract art as generic. Do not restore repetitive covers. Placeholders are temporary missing work, never the requested deliverable. Complete the artwork and verify it on the actual Discover card before claiming completion.

This clarification supersedes the earlier instruction to mirror real interfaces or preserve UI layout. Semantic relevance to the resource is required; literal UI fidelity is not.

## Production checklist

1. Identify the exact resource ID and canonical application/example. Read its source material.
2. Gather references explaining its purpose, features and audience; create an individual art direction. Source screenshots/assets are optional inspiration, not a required visual format.
3. Write a unique scene brief describing what is shown, why it represents this resource and how it differs from existing previews.
4. Render a smooth loop. Inspect multiple frames and playback, including the loop boundary, actual card crop, text legibility and thumbnail size.
5. Compare against the existing library visually. Reject duplicate compositions and reskins. File-hash uniqueness alone is not proof of visual uniqueness.
6. Record reviewer, date, source references, subject relevance and uniqueness decisions. An agent may review after actually inspecting the source and output; never auto-fill an approval from metadata.
7. Preserve the original source thumbnail and publish only the reviewed clip. Keep media runtime artifacts outside Git. Publish media under immutable filenames, then atomically publish the reviewed index. Never overwrite an approved file in place: hashes are checked when the index loads, not continuously during playback.

## Enforcement

The repetitive 146 DiscoveryCover loops remain retired. Existing AppCover feature videos need individual review under this clarified standard: genuinely distinct, resource-relevant illustrations are eligible; generic reskins are not. The batch entrypoints report pending work rather than producing generic replacements. Missing video is preferable to a misleading one: display the original source thumbnail until a compliant clip exists.

For a generated runtime index entry, use `source: "cover"`, the exact `id`, local `video`/`image` paths, and `review` containing:

- `policyVersion: 1`, `resourceId` equal to `id`
- `reviewer`, ISO `reviewedAt`
- `faithfulToSource: true`, `uniqueVisual: true`. The legacy field name `faithfulToSource` means the artwork is about the correct resource and makes no false feature claims. It does NOT require screenshot or interface fidelity.
- `sceneDescription` describing the specific scene (at least 30 characters)
- `references`: nonempty source URL list
- `videoSha256`: the SHA-256 of the reviewed MP4

The loader rejects unreviewed generated files, hash mismatches and reused identical generated files. It matches approved generated previews by exact resource ID only. Review is still essential: metadata and hashes cannot mechanically establish subject relevance or visual uniqueness. Original upstream media and genuine capture entries remain source-labeled; all newly created captures must follow the same visual review checklist.

## Regeneration queue

Run `node creator-hub/video-templates/scripts/render-discovery.mjs` from the repo root to list resources needing video and their source links. Work one resource at a time, replacing an original thumbnail only after the new clip passes this policy. Do not mark full coverage complete merely because every resource has a renamed or recolored file.

## Playable game demonstrations

When a preview is requested as actual gameplay, record meaningful player actions and a successful complete core loop. For an endless game, show the reward or upgrade and its effect on the next cycle; do not imply a final win. Use normal game speed, deliberate interactions, and short readable pauses before choices and after outcomes. Aim for 40–60 seconds for a simple loop, adjusting to the game. Passive scrolling, idle counters, and generated illustrations do not satisfy this requirement.

Use an isolated save and an explicit game-specific recorder. Assert the intended outcomes before rendering, save timestamped progression evidence, and inspect the actual footage before publishing immutable media references. Never inject progress, speed up the simulation, or touch a real wallet to stage success.

### Opening frame gate

A gameplay preview must open on ready gameplay, never navigation, loading markup, wallet dialogs or a blank frame. Capture scripts must trim the measured navigation prefix, emit a decoded first-frame image, and require visual inspection before assigning the new content-hashed clip. Keep the opening hold long enough to absorb recorder startup jitter. Preserve the full core loop; browser event timings are evidence of actions, not frame-exact clip timestamps. Re-capture after changes rather than hiding an invalid opening behind a poster.

## App-wide presentation contract

- One resource ID has one resolved media selection across home, search, learning,
  recommendations and detail pages. Use `catalog.decorate` / `previewFor` on the
  server and `ResourceCardMedia` (or its `MediaThumb` wrapper) in the client. Do not
  recreate fallback or playback rules in individual pages.
- Seed still images are the lowest-priority local layer. Restored runtime videos
  must upgrade them. Keep upstream video and review checks intact.
- Use the shared crop, badges and muted inline playback. Pause offscreen; honor
  reduced motion; retain a useful poster when video is unavailable. A source
  thumbnail is a fallback, not proof that a video exists.
- When switching a serving checkout or runtime directory, attach/import its reviewed
  media library before visual sign-off. Run `npm run media:check -- <preview-origin>`
  from `creator-hub/hub`; keep the missing-media report in the handoff. Homepage
  coverage and full catalog coverage are separate claims.
- Review the actual homepage shelf, discovery grid and resource detail after any
  media-resolution change. Confirm advancing frames and compare the same resource
  across routes. New catalog imports need their own source-specific artwork; do not
  erase the gap with generic reskins or silently hide uncovered resources.

### Project presentation

Use `ProjectCover` across project features, workspace rows and project details.
Actual video playback must preserve the complete frame (`object-fit: contain`),
including captions and controls; never stretch a landscape clip to fill a tall
copy column. Poster-only releases must still render an image. Bespoke editorial
project illustrations must be labeled as illustrations, never captured gameplay.
Shared, authored client artwork belongs with its component source in Git; generated
video exports and runtime capture libraries continue to use the release handoff.
Use a paired original/remix feature when explaining remixing, with distinct covers,
separate play/project links and a verified description of the changed rule. Avoid
repeating those games as unrelated spotlight entries. Keep distinct starter cards
for additional calls to action; all versions remain in the Projects collection.
