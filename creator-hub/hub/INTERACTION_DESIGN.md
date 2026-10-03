# Ootle Lobby interaction design

September 22, 2026. The requested direction is a polished Korean collectible-game feel in Tari's purple, acid-lime and dark palette. Implemented in `client/src/HubMotion.tsx` and `HubMotion.css`, mounted once in Layout.

The home creator journey has four original SVG artifacts: a compass that turns, a field guide with a sparkling star, a faceted creation crystal with a tracing ring, and linked Riff blocks. Hover and keyboard focus lift the artifact and illuminate its card. Cards keep immediate normal link navigation. These illustrations are interface decorations, not resource/video covers.

Across routes, buttons compress on press, primary actions glow, navigation has a selected underline, linked cards lift, and button/link activation emits a six-particle burst. Effects never prevent default input, await an animation, or imply a save/purchase succeeded. Actual success celebrations must attach to confirmed application events, never a raw click. Do not add random reward mechanics or fabricated rarity to catalog entries.

Keep feedback brief and bounded: transitions 180–500 ms, click particles 600 ms, limited twinkle cycles. Use transform/opacity for motion and preserve original control semantics. The burst ignores disabled actions, cannot capture pointer events, is replaced on repeated interaction, and cleans up its listener/timer. Keyboard clicks originate at the control center. Reduced-motion preference removes movement and particles while retaining focus/border feedback. No audio, external assets or new dependencies.

Validation: production build and 27 existing client tests; visually inspected the running home journey at desktop and 390px mobile sizes; verified portal navigation into Create. These changes are shared interaction foundations, not a replacement of every page's composition. Future screens should reuse this language and confirm meaningful results before celebrating them.
