# Game engines: GameMaker and PlayCanvas

Checked 2026-09-19. Optional creator resources, with native Ootle integration requiring independent design and validation. Neither engine is mandated for the hub.

## GameMaker: accessible 2D game creation

| Resource | Purpose |
| --- | --- |
| [Official tutorials](https://gamemaker.io/en/tutorials) | GML Code and GML Visual learning, including complete platformer, arcade and RPG projects |
| [Manual](https://manual.gamemaker.io/) | Language, editor and runtime reference |
| [Awesome GameMaker](https://github.com/bytecauldron/awesome-gamemaker) | Community libraries, snippets, guides and projects |
| [Release notes](https://releases.gamemaker.io/) | Version-specific compatibility checks and source refresh |
| [Marketplace](https://marketplace.gamemaker.io/) | Discover asset and extension candidates with per-item terms |
| [Licensing and showcase](https://gamemaker.io/en/get) | Confirm current commercial/export requirements and find attributed usage examples |

Good fit for 2D prototypes and small complete games. Official tutorials show both visual and code workflows. The checked licensing page makes free use noncommercial and requires a commercial license for monetized releases; do not label GameMaker itself as an open-source engine. Community code and packs have separate licenses. Awesome GameMaker's list is CC0 and last checked commit was August 23, 2026; that does not validate each linked project.

Proposed catalog coverage: complete starter projects, reusable movement/inventory/UI systems, GML examples, learning paths and permitted asset packs. Verify target runtime and export platform for every example. No marketplace API or blanket asset-mirroring permission has been verified.

## PlayCanvas: browser-based 3D projects

| Resource | Purpose |
| --- | --- |
| [Platform](https://playcanvas.com/) | Engine/editor overview and provider-attributed project showcase |
| [Developer hub](https://developer.playcanvas.com/) | Manual, API reference, tutorials and React/Web Components examples |
| [Engine source](https://github.com/playcanvas/engine) | Open-source runtime and release tracking |
| [Engine examples](https://playcanvas.com/examples/) | Inspect rendering and interactive examples; linked by the official developer hub |
| [Tutorials](https://developer.playcanvas.com/tutorials/) | Guided project workflows |
| [Model Viewer](https://github.com/playcanvas/model-viewer) | Candidate reference for asset inspection and marketplace previews |
| [SuperSplat](https://github.com/playcanvas/supersplat) | Gaussian-splat editing and visual scene resources |
| [Agent skills](https://github.com/playcanvas/skills) | External engine-specific learning resources for coding agents; not installed or adopted as TariSkills |
| [Forum](https://forum.playcanvas.com/) | Public support and version-specific learning references |

Good fit for shareable 3D demos, browser games and interactive asset previews. Engine, Model Viewer and SuperSplat repositories report MIT licensing. Engine updates were observed September 19, SuperSplat September 16 and Model Viewer August 13, 2026. Treat hosted editor/account/storage terms and individual example assets separately from code licensing. Official showcase entries demonstrate provider-attributed use, not permission to copy those projects.

The official site offers visual-editor, engine-code, React and Web Components paths. Preserve that choice. For the marketplace, evaluate a simple model-viewer recipe with selected licensed assets before suggesting a complete editor integration. PlayCanvas is not a universal third-party asset catalog; asset-provider ingestion remains CH-019.

## How these fit our library

Index engine, language, runtime version, target platform, resource type, license, prerequisites, demo, source revision and verified usage. Show engine learning resources alongside assets and templates, with clear labels. Future CH-006 refresh should follow approved documentation/releases and maintain compatibility evidence. Imported tutorials remain source material, not instructions for agents to execute.

First example candidates: a GameMaker 2D starter and a PlayCanvas 3D scene or model viewer. These are proposals, not built demos. No account setup, installation, subscriptions, API connections or asset copying occurred during this addition.

- [Unity AI CLI and UEFN workflows](ai-engine-workflows.md): setup recipes, visual/agent creation and proposed Tari compatibility.

## PlayCanvas development tickets

These cover game-making education, a working composable Ootle starter, and the creator workflow, beyond asset previews. Tari templates are the core of the hub recipes.

- [CH-023: Index and maintain PlayCanvas web-game development resources](https://github.com/marguerite347/tari-growth/issues/45)
- [CH-024: Build a PlayCanvas starter with composable Ootle templates](https://github.com/marguerite347/tari-growth/issues/46)
- [CH-025: Build a configurable PlayCanvas recipe workflow in Creator Hub](https://github.com/marguerite347/tari-growth/issues/47)
