# Game development collections

These collections are part of the Ootle Lobby resource inventory. Contributors can browse them here or load [collections.json](collections.json) when building catalog discovery and source ingestion. Existing lists are included once in the structured inventory; no separate forks are required.

| Collection | Bucket | Use in the hub | Latest source commit checked |
| --- | --- | --- | --- |
| [awesome-godot](https://github.com/Calinou/awesome-godot) | godot | Find Godot components and examples for the template catalog. | 2026-09-12 |
| [bevy-assets](https://github.com/bevyengine/bevy-assets) | rust-bevy | Find Rust game-client components; assess Ootle integration separately. | 2026-09-18 |
| [awesome-game-engine-dev](https://github.com/stevinz/awesome-game-engine-dev) | engine-systems | Support system design and deeper implementation learning. | 2026-08-17 |
| [open-source-games](https://github.com/bobeff/open-source-games) | complete-games | Find end-to-end implementations to study and candidate Riff projects. | 2026-02-25 |
| [awesome-web-games](https://github.com/twofactor/awesome-web-games) | browser-games | Find tools for browser-playable demos and lightweight game clients. | 2026-03-07 |
| [awesome-game-production](https://github.com/vhladiienko/awesome-game-production) | production | Support scoping, collaboration and getting projects finished. | 2026-05-04 |
| [procedural-generation](https://github.com/kchapelier/procedural-generation) | procedural-generation | Research level, terrain and world generation for remixable mechanics. | 2020-04-12 |
| [Awesome-Game-Networking](https://github.com/MongkonEiadon/Awesome-Game-Networking) | multiplayer | Study networking concepts; treat as an older reference, not an active feed. | 2018-11-04 |
| [awesome-gamedev](https://github.com/Calinou/awesome-gamedev) | general-gamedev | Existing resource: deduplicate against game-design.md; identify canonical upstream for this mirror. | 2026-08-25 |
| [awesome-game-design](https://github.com/Roobyx/awesome-game-design) | game-design | Existing resource: support design education and template explanations. | 2026-09-16 |

## Web presentation collections

See [Three.js and web design](web-design.md) for Awesome Three.js, Design Resources for Developers, Awesome CSS and practical React Three Fiber/Drei references. All three lists are also in the structured inventory.

## Use while building

1. Pick a collection matching the feature or template being built.
2. Follow its source to select a specific project, component or example.
3. Record that individual resource using the [marketplace record design](../TEMPLATE_MARKETPLACE.md): purpose, exact release, license, dependencies, demo, usage evidence and compatibility.
4. Validate setup before labeling it runnable or Ootle-compatible. Reference-only entries remain useful educational material.

The JSON includes stable collection IDs, categories, source URLs, pinned observed revisions and license metadata so future collectors can compare updates. Fetching new content and refreshing records is still CH-006 implementation work. A collection is a discovery source, not one template and not proof every linked project is open source.

License values describe GitHub’s detected license for the list, not every referenced asset or project. Unknown licenses need inspection before copying content. Current integration stores original descriptions and provenance, not vendored upstream code.

Awesome Game Networking last changed in 2018 and belongs in the older-reference bucket. Other commit dates document observations, not guarantees of ongoing support. Calinou/awesome-gamedev identifies as a mirror; resolve its canonical source before continuous ingestion.

## Additional engine collections

[Awesome GameMaker](https://github.com/bytecauldron/awesome-gamemaker) is indexed in collections.json. See [GameMaker and PlayCanvas](game-engines.md) for official docs, source examples and supporting tools.
