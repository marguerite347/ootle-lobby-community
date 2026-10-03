# AI creation and pixel art

## Sprite Fusion + Jev: real-time level generation

[Article](https://www.spritefusion.com/blog/generating-game-level-in-real-time-with-jev), Hugo, September 18, 2026. Page read 2026-09-19.

- **Purpose:** an experiment in runtime level generation and pixel-art production.
- **How it works:** the described Phaser runner sends game-state context to Jev, receives structured terrain choices, and places blocks. Sprite Fusion supplies sprites and animation assets.
- **Useful for:** studying constrained AI-generated levels, asset workflows and latency/cost evaluation. Cross-tag AI-assisted development, level design, pixel art and prototyping.
- **Evidence:** an author-reported experiment, not a tested Tari integration. Reported cost/latency samples are not production guarantees.
- **Placement correction:** this is not an analytics tracking service. It may inspire performance instrumentation, but it does not replace Pixel, product telemetry or the growth dashboard.
- **Before reuse:** verify current APIs, engine/runtime requirements, output/asset terms and playable-level validation. Link to upstream rather than importing generated assets automatically.


## Additional creator references, reviewed September 22, 2026

- [AI game-level workflow: Stefan 3D AI](https://www.youtube.com/watch?v=6Ytluv_DiSo): Video walkthrough from environment concept and model creation through textures, UVs, PBR materials, Blender assembly and Unreal setup. Follow as a learning workflow; the title describes free tools, but linked services can have paid tiers and changing limits. Sources: [reference 1](https://learn3d.ai/3d-ai/free-level), [reference 2](https://studio.tripo3d.ai/home), [reference 3](https://top3d.ai).
- [Tripo Studio](https://studio.tripo3d.ai/home): AI 3D creation service linked in Stefan 3D AI’s environment workflow. Evaluate model generation as an optional asset-creation step; review current quotas and export terms. Sources: [reference 1](https://www.youtube.com/watch?v=6Ytluv_DiSo).
- [Learn3D AI environment course](https://learn3d.ai/3d-ai/free-level): Environment-building course linked by Stefan 3D AI, from rough concept to an Unreal scene. Use for structured environment education; access and pricing follow the provider. Sources: [reference 1](https://www.youtube.com/watch?v=6Ytluv_DiSo).
- [Top3D AI tools directory](https://top3d.ai): 3D AI tools directory linked by Stefan 3D AI. Discover candidate tools, then check each provider’s actual capabilities and terms. Sources: [reference 1](https://www.youtube.com/watch?v=6Ytluv_DiSo).
- [LAST FRAME: realtime video adventure](https://github.com/blendi-remade/interdimensional-game): Video-driven adventure experiment with branching generated clips and continuous live scenes. Study its Next.js and fal-based workflow. Requires a server-side fal key and paid inference; license and Tari integration are not verified. Sources: [reference 1](https://x.com/blendibyl/status/2094337651189166368).
