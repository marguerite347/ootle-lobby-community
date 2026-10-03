# Cursor and particle motion references

Reviewed 2026-09-23. These are discoverable catalog references, not installed Hub dependencies.

- [tsParticles](https://github.com/tsparticles/tsparticles): configurable particle effects and framework components; candidate for reusable creator-project trails and celebrations.
- [React Bits Splash Cursor](https://reactbits.dev/animations/splash-cursor): fluid visual reference; assess GPU cost and readable-content layering before adopting.
- [Cursor Effects](https://github.com/tholman/cursor-effects): compact examples of trails, following dots and fairy dust with cleanup and reduced-motion guidance.
- [Codrops dreamy particles](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/): Three.js/GPGPU tutorial for richer hero or game art.

## Current Hub choice

Reused the bounded Canvas comet in `hub/client/src/cometCursor.ts`, the existing Effects switch and reduced-motion handling. Applied interface-motion and readable-code guidance. Added a frame-time-based follower with a 90ms time constant, slower drifting sparks, a lower particle cap and gentler fades. Native pointer accuracy stays independent of the decoration. No library code was copied or dependency installed.

The resource registry and committed catalog seed include these references so a fresh environment has them. Source freshness remains curated/editorial; this does not imply automated upstream monitoring. Review exact upstream terms, pinned versions and runtime cost before reuse.

Validation: client suite (60 tests) and production build passed; Discover cursor search displayed the new libraries. Perceived motion remains a user judgment; the controls and stop/cleanup behavior are covered by the existing comet tests.
