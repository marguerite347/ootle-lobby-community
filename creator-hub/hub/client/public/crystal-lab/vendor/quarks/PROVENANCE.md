# Comet orbit VFX reuse

three.quarks npm0.17.1 and quarks.core resolved with it, MIT. Local distribution
files retain upstream headers. The three.quarks bundled header reports0.17.0;
installed npm package version is0.17.1. No shader changes in these distributions.
https://github.com/Alchemist0823/three.quarks
Example/texture snapshot: de7c207f791c8b2260c43334a282976221688b1b (2026-09-24).
Sources: packages/quarks.examples/trailDemo.js and followObjectDemo.js, copied here.
Textures: packages/quarks.examples/public/textures/particle_default.png and projectile.png.

CometOrbits.js adapts these examples: existing Quarks trail renderer, moving-emitter
followLocalOrigin, width-over-length and size/color-over-life behaviors. Adapter
sets two elliptical paths, palette, charge acceleration and outward settling sweep.
No new ribbon shader or generated effect texture. Upstream MIT notice included.

This supersedes the ICS floor/magic-circle effect. The live scene no longer imports
ICS or GSAP. Demo only, no live reward calls. Reduced motion prewarms one static
trail pose and freezes; Pause motion freezes the simulation.
