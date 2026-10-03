# Native Spline wheel proof

Local review: http://127.0.0.1:4222/wheel-lab/native.html

This is an isolated, scripted visual fixture. It never requests reward settlement,
reads an account, consumes an attempt or changes an AI Sparks balance. It appears in the edited video proof, but is not integrated into trivia settlement. No sound has been added.

## Editable source and ownership

Base scene: https://app.spline.design/file/1b502e19-9ff9-4710-9f77-5798c7fc37dc
Code export: https://prod.spline.design/TnoLHmSszwI2SlPF/scene.splinecode

Chris Gannon's Spin2Win Wheel 3D, Envato item GJZR3TY, is the actual authored
wheel. It is not a procedural replacement. Envato download showed Automatically
licensed. Keep the original `.spline` and exported meshes out of public Git and
standalone asset distribution. The editable base lives in the authorized Spline
workspace. The runtime loads the frozen local `scene.splinecode` versioned with Git LFS. The hosted URL is provenance, not the playback dependency.

`native.js` is the editable Ootle adaptation: native Spline runtime materials,
labels, lighting and controlled spin. These changes are applied
at runtime, NOT saved back into the Spline editor document. Edit this adapter
for the proof. Moving these adaptations into the editor remains separate work;
do not claim the editor already contains the fully customized wheel.

The actual CC0 crystal is reused from `../crystal-lab/crystal.glb`. Its proportions
match the accepted crystal proof (the original mesh is very tall and narrow).
The hub embeds the approved Three.js crystal renderer without the standalone glitter spiral. Its wheel-only glass material increases transmission and reflections. A same-origin message drives a matching contact light; this is synchronized lighting in separate renderers, not shared physical reflections. Standalone crystal styling remains unchanged.

## Restore

From `creator-hub/hub`, run `node scripts/restore-wheel-runtime.mjs` to obtain the
pinned official Spline runtime 2.0.57 with SHA-256 verification. The vendor bundle
is ignored. Restore the existing crystal-lab assets through their documented
handoff. Build using the repository's preview continuity procedure. Do not start
a competing listener or reset runtime data. Run `git lfs pull` to hydrate the frozen scene and media. This proof currently requires WebGPU.

## Behavior and verification

- Twelve wedges repeat the server's six-slot distribution `[1,2,1,3,2,5]` twice.
  The proof controls select a scripted landing; they are not a random reward draw.
- 650ms anticipation, then a 5.8-second spin with gradual slowdown. The pointer
  stays separate from the rotating wheel. The crystal stays upright.
- Reduced motion and Show result settle at the same selected wedge and amount.
- The template's interactive event system is disabled with the public
  `Application.start(buffer, {interactive:false})` API. Its original variable
  watcher referenced missing objects and emitted errors; it is not our spin logic.
- Reviewed at desktop and 390×844. Verified 1×=100, 2×=200, 3×=300, 5×=500;
  full animated 5× landing, reduced motion and skip. No real credits awarded.
- Spline Max Logo=No was selected through the official export controls and the
  code export updated. Never hide the watermark with CSS or runtime patches.

Acceptance of visual direction is pending user review. Remaining: source-editor
adaptation, final celebration/audio, capture/video integration and broader browser
performance checks. Do not merge this proof into the live reward component as-is.

## Glow-up review pass

- Poppins ExtraBold multiplier textures, outlined dimensional numbers, reflective
  lacquer and metallic bevels. Studio environment is shared by wheel materials.
- Envato VTechnoK XAB3FPF, Abstract Glowing Fire Sparks Alpha Overlay Pack:
  https://elements.envato.com/bullet-impact-sparks-pack-2k-XAB3FPF
  Downloaded through the authorized account; license entries observed 2026-09-24.
  Selected `2k/remaster 24 2k.mov` after a frame contact-sheet review.
- Private original ZIP SHA-256:
  `2632a42a75e7895255011bdcdc8f9c06c1c66568c859c148f341bd743d8c1d79`.
  Original and extracted clips remain in Movies/Tari-Creator-Hub-Media/creator-story/wheel-source.
- Local derivative `grinder-sparks.mp4` is licensed media tracked in private Git LFS. Crop original
  1400x900 at 200,100, resize to 840x540, multiply RGB by a 65px linear feather
  at each edge, encode H.264 CRF19, no audio. Additive compositing uses black.
  SHA-256 `e8b452a9c50613f20ad7ace04bdee39f498ba0c40efa9cc32d562eb664cab173`.
  Restore this derivative alongside native.js. It is versioned with Git LFS in this private repository; follow the reward-proof handoff verifier.
- Four reusable video planes emit at wedge contacts with a minimum interval,
  finish with an impact, and stop in reduced motion or with Spark effects off.
- This pass was inspected through full 5x desktop motion and settled result,
  plus 390x844 reduced-motion 3x. No browser console errors in that run.
- Native Spline transmission trial was rejected after invisible glass and a tab
  crash. The current hybrid proof subsequently completed the spin. Longer soak
  testing and additional browser support remain open. Silent video capture is now saved in the reward-proof repo assets; audio remains open.

The earlier single Hero Pink treatment is superseded by the shared seven-loadout palette module below.

## Automatic crystal color loadouts

Each page load programmatically selects one of the seven palettes in
`../crystal-lab/palettes.js`. It remains stable through spins and resize.
This design lab retains palette and energy-style selectors for review only.
Do not include those controls in the actual website. Electric spark is the
default; internal crystal fixture URL parameters support repeatable captures. See design-system/CRYSTAL_COLOR_LOADOUTS.md for the seven three-role loadouts.

## Motion and transparent layers

Motion is enabled by default (respecting reduced motion). Hold crystal still is
an opt-in design comparison tool; it pauses the gem and inner energy. Both spinner
wheels omit the Envato glitter swirl by user direction. The wheel embed never
constructs its video, orbit meshes or source-sampled lights. Standalone crystal
reveals retain the licensed orbit. Pointer/grinder sparks remain in the Spline
scene, and the wheel contact-light message still illuminates the crystal.

The fitted dark backing isolates the full translucent gem, including the tip,
from bright wheel wedges and hub trim. Preserve that backing, chromatic facets,
edge contrast, electric core and default rotation. The orbit removal is not a
request to flatten or freeze the crystal. Recheck both first and Super wheel.

## Capture checkpoint, September 24

Use `native.html?film&base=150&palette=reactor` for the trivia edit. Film mode hides authoring controls, `base` accepts only 100 (default) or 150, and an explicit palette stabilizes the capture. This still has no settlement API. The 5x demo displays 750 for a 150 base; never cut from a 150 trivia reveal to the default 100 wheel.

Runtime adapter changes are committed; the editable Spline source scene has not been updated with these material/VFX changes. Current private source assets remain in the paths above. Repo-native Git LFS asset restoration is documented in `creator-hub/handoff/reward-proof/README.md`.

Fresh-agent entry point: [rebuild guide](../../../../handoff/reward-proof/README.md). This guide supersedes historical Mac-local restore notes.

## Super transition proof

Open `native.html?super&film&base=150` for the two-wheel sequence. Spin the first
wheel, choose Continue to Super, then Take the Super Spin. Defaults are scripted
5x then 50x total. Keep my haul ends with 750. Without `film`, proof controls
select all four Super outcomes and reduced motion. Normal `native.html` is unchanged.

`super-disc.js` draws a weighted face texture on a physical Spline plane attached
to the original wheel rotation. It replaces the template's equal face segments
and hides their overlapping bevel pieces; the source scene, pointer, lighting,
contact VFX and crystal adapter are reused. This is a first adaptation, not a
new weighted editable Spline scene. The narrow 50x outcome has a larger readable
external odds label. No new licensed assets or private paths were added.

Verified: full animated 5x -> Super -> 50x/7,500, skip, minimum 5x/750, 10x/1,500,
25x/3,750 with reduced motion, and decline retaining 750. Desktop and 390px layout
inspected; no horizontal document overflow. Sixteen server and visual-distribution
tests pass, and Hub build passes. Test command from root:
`node --test creator-hub/hub/server/test/superWheelProof.test.mjs creator-hub/hub/server/test/dailyTrivia.test.mjs`.

Still open: user creative acceptance, fully dimensional weighted sector geometry,
full jackpot art/sound treatment, new captured video, real app integration and
cross-browser fallback. This proof never calls reward endpoints. The saved
wheel-pass-v4 MP4 remains the earlier first-wheel-only cut.

Current A+C demo captures use `palette=nova`, per user direction. The original
Pink Reactor take remains historical. Both wheel stages omit the Envato swirl.

## Lobby playtest integration

See repository path `creator-hub/handoff/reward-proof/PLAYTEST.md`. `embed` mode requests host outcomes before spinning; it never calls a reward API. Super radius now matches the first wheel (650-unit face); true-alpha grinder video overlays replace the former additive planes, which showed black rectangles in the transparent embedded stage. See PLAYTEST.md for the derivative command, warmup, current endings and random palette rules.
