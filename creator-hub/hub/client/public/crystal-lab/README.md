# Licensed sparkle orbit lighting proof

Open `/crystal-lab/index.html` on isolated port 4222. No credits, awards or live
trivia calls. User accepted v9 at `a87620d` on September 24, 2026. This is an accepted visual proof, not a merged production reward sequence.
Canonical design guidance: [AI Spark crystal](../../../../design-system/components/AISparkCrystal/README.md).

## Reused resources and acceptance

User approved Direnox's Golden Glitter Particle Spiral Reveal Animation (984PF3C):
https://elements.envato.com/gold-particles-trails-spiral-animation-alpha-loop-984PF3C
Envato signed-in download confirmed "Automatically licensed" on 2026-09-24.
Master: 2560 x 1440, 30 fps, 4.7 seconds, ProRes yuva444p12le with alpha.
The authored motion is retained; runtime shader recolors its luminance purple/lime.
Rejected handmade ring, ICS floor circle and generic Quarks comet are superseded.

Three.js 0.184.0 and GLTFLoader are pinned locally. Crystal by iPoly3D:
https://poly.pizza/m/7iHQpCXTb7 (CC0). Original mesh unchanged, runtime proportions
and physical material adapted. Relevant workflows: resource-first-workflow,
threejs-materials-lighting, threejs-gltf-loading and creator-hub-demo-capture.

## Restore media

The current master and derivative are versioned using Git LFS in this private repo.
Run `git lfs pull` and `python3 creator-hub/handoff/reward-proof/restore.py` from
repository root. See [the complete rebuild guide](../../../../handoff/reward-proof/README.md).
Master: `creator-hub/handoff/reward-proof/assets/masters/spiral.mov`.
Derivative: `creator-hub/hub/client/public/crystal-lab/spiral.mp4`.
Use `prepare-spiral.sh` if intentionally regenerating; update the manifest and verify
rendered motion afterward. No Downloads/Movies directory is needed. Keep licenses
and this project's access restrictions; never use the watermarked source preview.

## How illumination works

SpiralOrbit.js maps the actual video onto a densely subdivided annular surface with depth testing, allowing
opaque crystal facets to occlude the back portion. Additive RGB preserves the dark
scene and glow. This is a planar animated VFX surface, not volumetric particles. The source spiral
center is corrected to UV (0.5, 0.40); radial remapping reserves 1.12 world units
of clearance around the gem instead of allowing the expanding source to start
inside it. The lower arc faces the camera and the upper arc passes behind.

A 64 x 36 canvas samples decoded frames into eight spatial bins. Brightness-weighted
centroids set the position of eight colored point lights, mapped through the same radial function and transformed through the
same surface matrix. Squared brightness controls intensity, capped to preserve facets.
There is no separate guessed orbital clock. Pausing freezes the video and lights;
charge changes video speed and light strength together. Reduced motion starts with
a still sampled pose. "Spark lighting" toggles these eight lights for comparison.

This approximates emitted illumination. It does not compute reflections of individual
sparkles, cast particle shadows, or provide a physically accurate emissive environment.

## Verification

Build with `npm --prefix creator-hub/hub run build`.
Capture with `node creator-hub/capture/creator-story/capture-crystal-lab.mjs`
and `--phone`. Script records idle, charge, a full loop and paused lighting on/off.
Inspect both images at the same paused pose, not unrelated rotating frames.
Keep text and controls clear; compare desktop and phone composition; check reduced
motion and media restore errors. No production integration before visual acceptance.

Tail cleanup: the source expands into its frame boundary near the end. A smoothstep
feather over 18% of each UV edge replaces the narrow 8% mask. A cubic envelope
fades the last visible sweep from source time 2.55 to 3.80 seconds, before the
source's empty ending. Both shader brightness and sampled light energy use the
same feather and video-time envelope, so pause/charge preserve synchronization.

Asset integrity (SHA-256, accepted local proof):

- Licensed ProRes master: `d49813314916d1ba9556a40d783797562063578c36a063188f7550d53b062d1b`
- Playback derivative: `f98e5c0bb99c8e90752ec8409304a7707aaa94bd2aea4e70be9eb573504f6d3a`
