# AI Spark crystal and sparkle orbit

## Acceptance and scope

User accepted the rendered crystal-lab v9 treatment on September 24, 2026:
"that works! ok lets accept these changes". Accepted implementation: `a87620d`
on `codex/trivia-answer-impact`, PR #264. This is the approved visual reference
for the AI Spark crystal, orbit placement, illumination and tail finish.
It is not evidence that trivia integration, reward settlement, the full sizzle reel,
main previews or production have been updated. Those remain separate deliveries.

Preview route: `/crystal-lab/index.html?v=9` on the isolated 4222 server.
[Editable implementation and restore instructions](../../../hub/client/public/crystal-lab/README.md).
[Capture script](../../../capture/creator-story/capture-crystal-lab.mjs).
Local URLs are review conveniences, not portable asset storage.

## Visual contract

- A large, faceted purple 3D crystal is the focal object. Preserve its dimensional
  highlights, readable silhouette and contrast against the ink background.
- Use the approved Direnox Envato sparkle animation, recolored violet/lime.
  Preserve its authored glitter detail and sweeping motion. Generic particle
  blobs, bead hoops, runic floor circles and simply increasing particle count
  are not equivalent substitutes.
- Orbit in a tilted ellipse with a clear central opening. Upper arc behind the
  crystal, lower arc in front. No slicing through the mesh, off-center expansion
  or clipped edges at phone widths. Check every phase, including charge scale.
- Let the sparkle illuminate nearby facets. Use the animation's decoded frames
  to drive light positions and energy through the same coordinate mapping.
  Keep facets visible; do not wash the crystal into flat white or purple.
- End in a soft dissolve. Feather the source boundaries and fade its final sweep
  before the video crop becomes visible. Fade the illumination with the effect.
- Name the credits **AI Sparks**. Keep them distinct from native TARI. Do not imply
  a credit award, redemption or AI integration merely because the visual plays.

## Accepted implementation reference

Three.js 0.184.0; iPoly3D Crystal GLB (CC0); Direnox item 984PF3C (licensed Envato
master, automatically licensed on download September 24). This is a real 3D mesh
with a video-textured VFX surface and approximate emitted lighting, not volumetric
sparkles or physically accurate reflections of individual particles.

The source center is UV (0.5, 0.40). A subdivided annular mapping reserves 1.12
world units around the gem before responsive scaling. Surface tilt is -1.15 rad
on X and -0.20 on Z. Eight lights sample brightness at 64 x 36 resolution.
The UV boundary feather is 18%; smoothstep tail fade runs from video time 2.55
through 3.80 seconds. These are reference-scene settings, not global UI tokens.
Retune only against rendered evidence if the gem or camera changes.

## Integration acceptance

Reuse the accepted visual without copying the lab's developer controls into the
product. Bind playback to the actual reward state. Preserve authoritative reward
values and make skip/replay presentation-only. Provide effects-off and reduced-motion
states, protect text/CTA bounds, and keep audio opt-in. The standalone lab supports
pause, reduced motion and a lighting comparison; it does not prove the integrated
product's effects-off behavior or reward correctness.

Capture one complete idle/charge/fade/restart cycle at desktop and phone sizes.
Inspect beginning, peak and tail frames, front/back occlusion, and a paused lighting
on/off comparison at the same pose. The source intentionally fades out between
loops; uninterrupted idle sparkle would be a separate visual change. Record exact
served revision, browser errors, media loading, capture paths and actual audio
review status. Passing builds do not replace visual acceptance.

## Three-color loadouts

Use the [crystal color loadout guide](../../CRYSTAL_COLOR_LOADOUTS.md) for Pink Reactor, Plasma, Voltage, Aurora, Nova, Arcade and Dark Energy. Edge shadows, facets and inner glow have separate color roles. The guide records exact hex values, the shared renderer source and contrast/translucency review criteria.

## Wheel material checkpoint

The September 24 wheel pass adds chromatic facet contrast, a contained electric spark (soft flame remains an authoring alternative), a fitted dark backing to block wheel/rim bleed. See the [wheel adapter notes](../../../hub/client/public/wheel-lab/README.md). The backing must render before the transmissive shell; it must not cover the material or inner energy. Inspect several rotation angles after transparency changes.

Choose from the seven shared loadouts programmatically on fresh load, keeping the choice stable within the interaction. Palette and energy selectors belong only in the design lab. The original film captures used Pink Reactor; the current A+C demo uses an explicit Nova override for continuity. These runtime adaptations have not been saved back into the editable Spline document.

## Spinner placement

On both spinner wheels, omit the Envato glitter swirl around the crystal. Keep
rotation, inner energy, facet/edge contrast and the fitted dark backing. The
standalone reward reveal keeps its orbit. The current A+C demo uses Nova: orange
facets, violet edge shadows and a cyan core, fixed across shots for continuity.
Normal product loads still choose from the shared palette set automatically.
