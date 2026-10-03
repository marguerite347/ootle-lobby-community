# Wheel asset discovery, September 24

Requested: reuse and adapt a polished finished wheel, following the accepted
crystal asset workflow. Keep the real server-selected multipliers and rewards.

Selected candidate (user returned to this direction after comparing CGTrader): Chris Gannon, Spin2Win Wheel 3D, Envato GJZR3TY.
Source: https://elements.envato.com/spin2win-wheel-3d-GJZR3TY
Live preview: https://my.spline.design/defaultspinwheel-ffc6b7f9e391b5db04d8e69a3b15828e/

Inspected the source preview in the in-app browser and clicked its spin control.
It rotates and settles, with a substantial extruded rim, reflective panels and
separate pointer. Vendor lists animated SPLINE,5.69MB,18K polygons and textures.
This is a promising source visual, not an acquired or integration-tested asset.
The in-app vendor page shows Sign in; prior Chrome entitlement does not establish
this item's license. No purchase or download performed in this discovery pass.

Proposed adaptation: purple/lime materials, readable six-wedge1/2/1/3/2/5 layout,
replace QR center with AI Spark identity, more frontal camera, clear pointer
contact and settled winner. Replace template random outcome logic with the
existing authoritative result. Preserve odds and reward accounting.

Alternatives considered: ePatmos wheel G8LDP2Q is After Effects, suitable for
rendered promos but not direct live game control. PixelSquid prize wheels are
listed as Renders rather than editable interactive models, so not first choice.

Next validation: acquire through existing authorized Envato entitlement, inspect
editable hierarchy and export rights/capabilities, then test one six-wedge spin
against a known server outcome. Spline documents JS/React code export and GLB;
actual material fidelity, editing access and controllability remain unverified.
Do not install a new pipeline or claim this is ready merely because the hosted
preview works. First show the source visual before substantial adaptation.


## Superseded trial: CGTrader Lucky Wheel

User selected the free 3D candidate on September 24, 2026.
Author: ava1998mi. Model ID: 5388489.
Source: https://www.cgtrader.com/free-3d-models/sports/toy/lucky-wheel-f1474299-4db5-44de-af50-c824d5490bc4
Listed formats: FBX and OBJ. Source preview inspected; substantial concentric
rim, eight raised wedges, separate-looking pointer and center cap. Actual mesh
separation is unverified until the files are obtained.

Reuse: existing crystal-lab Three.js renderer, lighting/material setup and local
isolated preview. No new renderer or model-generation service is needed. First
trial should import the actual mesh and run one controllable spin before broad
integration into trivia or video.

Direction: glossy purple rim, purple/lime panels, large readable multiplier
labels, AI Spark center, brighter edge light, fixed pointer and a deliberate
slowdown into a clean settled reward. Keep source silhouette and physical depth.
Inspect the eight-sector hierarchy before reconciling it with the existing six
reward sectors; never silently change reward probabilities to fit the asset.
Demo spin must be labeled non-awarding. Verify phone framing and reduced motion.

Access check: Free Download opens Log in in both checked IAB and Chrome sessions.
Awaiting user sign-in in the Chrome CGTrader tab. No source file acquired, no
model modification, no implemented or served wheel proof yet.

License shown: Royalty Free License (no AI). Terms reviewed:
https://www.cgtrader.com/pages/terms-and-conditions
Sections 21A, 21B and 24 cover incorporated works, redistribution safeguards and
prohibit use for machine learning/training. Do not send the asset to a generative
model. Keep original files out of public Git and public remix/starter exports.
Confirm packaging safeguards before any public distribution; local proof first.

Next: complete authorized download after sign-in, inventory meshes/materials and
pivot, compute checksums, verify loading with the pinned renderer, adapt and show
one full spin. Acquisition, adaptation, visual acceptance and product integration
remain separate milestones.

## Spline acquisition checkpoint

User explicitly prefers the original Spline wheel over CGTrader. CGTrader is
no longer the implementation target. Reuse the authored Spline scene, preserving
its physical depth and animation quality, before considering export/integration.

Authenticated Envato asset page:
https://app.envato.com/3d/d8e817d9-d805-457e-a33b-ada11a85df5c
Download acquired and imported into Spline. Source SHA-256:
`37a35690d9e462487651d52084d6592edcf9638c3cc5176ec075847cef592fc4`.
The user upgraded winkaboo's Workspace to Max. Native code export is callable
and the isolated wheel proof is served at `/wheel-lab/native.html` on 4222.
See `../../hub/client/public/wheel-lab/README.md` for the editable base, runtime
adapter, pinned restore command and verification limits. Geometry-only export
was superseded by native Spline rendering. Adaptation lives in code, not yet
inside the Spline editor. No trivia/video integration or visual acceptance yet.
