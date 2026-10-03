# Cooperative modding ecosystems

Candidate sources and design lessons from the user's pasted research. Primary links and default-branch activity were checked 2026-09-19. Repository activity is not proof of complete documentation, support responsiveness or compatibility. Planning only.

| Ecosystem | Sources | Evidence and treatment |
| --- | --- | --- |
| Stardew Valley | [SMAPI](https://smapi.io/), [SMAPI source](https://github.com/Pathoschild/SMAPI), [modding wiki](https://stardewvalleywiki.com/Modding:Index), [Content Patcher](https://github.com/Pathoschild/StardewMods/tree/develop/ContentPatcher) | SMAPI default branch changed September 13, 2026. StardewMods last checked default-branch change March 29, 2026; verify Content Patcher-specific freshness before promotion. |
| Geometry Dash | [Geode source](https://github.com/geode-sdk/geode), [documentation](https://docs.geode-sdk.org), [tutorial handbook](https://docs.geode-sdk.org/#/handbook/chap0) | Geode default branch changed September 18, 2026. Its homepage returned 403 to research tooling; documentation links were verified in the project README, not end-to-end tested. |
| Risk of Rain 2 | [R2API](https://github.com/risk-of-thunder/R2API), [R2Wiki](https://risk-of-thunder.github.io/R2Wiki/), [BepInEx](https://github.com/BepInEx/BepInEx), [Thunderstore](https://thunderstore.io/) | R2API changed September 18 and BepInEx September 1, 2026. Verify each package/game-version combination separately. |
| Slay the Spire | [BaseMod](https://github.com/daviscook477/BaseMod), [BaseMod wiki](https://github.com/daviscook477/BaseMod/wiki), [ModTheSpire](https://github.com/kiooeht/ModTheSpire) | Reference/watchlist: checked default branches last changed August 21, 2025 and January 24, 2023 respectively. This does not establish that the broader community is inactive; current release/support/fork activity needs investigation before active-feed promotion. |

[CH-014 implementation checklist](https://github.com/marguerite347/tari-growth/issues/35) tracks verification and inclusion using the shared source pipeline.

## Ootle Lobby design lessons to explore

- Give beginners one small, complete first-mod or first-template walkthrough with visible results.
- Make reusable community APIs and components discoverable alongside the projects that use them.
- Show dependencies, versions, extension points and tested combinations so remixing is understandable.
- Pair examples with troubleshooting, validation tools and a clear contribution path.
- Preserve creator attribution and Riff lineage; allow community corrections and collections.

These are design proposals, not measured claims about the named communities. For TariSkills and native applications, redesign each pattern around actual Ootle/Tari semantics and test it. Keep external learning resources clearly labeled.

Do not republish unsupported claims from the pasted text: exceptional community quality, developer endorsement, automatic compatibility, or unrestricted JSON modification of all game logic. Specific sub-frameworks mentioned in the paste remain unverified until individually checked. Public support links are useful resources; private conversations are outside collection scope.

## Trackmania and Tabletop Simulator

Added 2026-09-19. Source pages were inspected; tools were not installed or exercised. These extend CH-014 and the shared ingestion plan, not a separate feed implementation.

| Resource | Planned coverage | Verification and limits |
| --- | --- | --- |
| [Trackmania Exchange](https://trackmania.exchange/) | Maps, replays, creator attribution, collaborative maps, mappacks, featured collections, mapping contests and public API discovery | Live site exposes these categories and links [ManiaExchange API](https://api2.mania.exchange/). Inventory game-specific Exchange sites separately, since the network spans several destinations. Community awards, editorial features and official Track of the Day selections must remain distinct. API access, rate limits and reuse terms still need validation. |
| [ItemExchange](https://item.exchange/) | Custom items, blocks, signs and reusable asset collections | Linked by Trackmania Exchange, but direct retrieval timed out. Verify catalog fields, update activity and individual asset permissions before active ingestion. |
| [Openplanet](https://openplanet.dev/) | Candidate plugin documentation, examples, releases and plugin discovery for Trackmania | Homepage and docs returned 403 to research tooling. Verify supported game editions, AngelScript/API details, current maintenance, catalog review rules and upstream repositories before publishing detailed claims or enabling collection. No blanket plugin-security guarantee. |
| [Blendermania](https://github.com/skyslide22/blendermania-addon) | Blender asset creation/export guides, releases, examples and compatibility updates | Verified README describes Trackmania 2020/ManiaPlanet item export, material setup, placement templates and conversion using Nadeo Importer. Old repository URL redirects here. Car skinning is explicitly unsupported. Verify release freshness, Blender/game compatibility and licenses before recommending a setup; extraction tooling mentioned upstream is not part of this ingestion scope. |
| [Tabletop Simulator Lua API](https://api.tabletopsimulator.com/) and [knowledge base](https://kb.tabletopsimulator.com/) | Global/Object scripts, events, decks, UI, JSON/save concepts, examples and learning paths | Official API explains global and per-object scripts and Lua stored within JSON saves. JSON storage does not make every game a freely reusable template. Check actual supported methods in each tutorial. |
| [TTS External Editor API](https://api.tabletopsimulator.com/externaleditorapi/) and [TTS Editor for VS Code](https://sebaestschjin.github.io/tts-tools/editor/latest/index.html) | Editor-to-game iteration workflows, scripts and debugging education | Official API and extension documentation checked. The extension documents Get Objects and Save and Play. Runtime behavior and current extension maintenance still need testing. [Atom was sunset](https://github.blog/news-insights/product-news/sunsetting-atom/); retain old Atom guides as legacy references rather than the default beginner setup. |
| [TTS Steam Workshop](https://steamcommunity.com/app/286160/workshop/) | Candidate discovery of tables, scripted examples and creator collections | Source destination for verification. Workshop distribution does not establish an open-source license or permission to mirror commercial board-game art, rules or fan adaptations. Record per-item attribution, license and dependencies; link rather than copy when reuse rights are unclear. |

### Implementation additions for CH-014

- [ ] Inventory canonical resource IDs, creators, game/tool versions, tutorial links, asset dependencies, licenses and source update dates. Verify current maintenance separately for each tool; a reachable documentation page is not maintenance evidence.
- [ ] Evaluate documented APIs, repository releases and permitted feeds first. Route approved updates through CH-006 and relevant discoveries through CH-010; retain stale-source indicators, removals and community edits.
- [ ] Add discovery filters for maps, asset packs, plugins, scripted objects and complete examples, with game/version prerequisites clearly visible.
- [ ] Prototype creator collections and collaborative project credits inspired by Exchange. Separate latest additions, measured trending activity and editorial selections; do not combine incompatible popularity measures across platforms.
- [ ] Prototype a short edit, preview, test and share learning path inspired by TTS. Connect scripted currency/deck examples to CH-015, then independently redesign any native Tari/Ootle implementation under CH-012.
- [ ] Verify public support destinations from primary project links. Do not describe specific Discord channels as official or active without evidence, or ingest private conversations.
- [ ] Test updates, redirects, removals, attribution and compatibility labels before listing these as automatically maintained sources.
