---
name: unreal-ai-blueprints
description: Set up Unreal Engine AI assistants and build reviewable Blueprint gameplay with compilation, Play In Editor checks, and portable Ootle Lobby handoff. Use for Aura, Ludus, Unreal AI plugin selection or Blueprint generation; route Fortnite islands to uefn-creator-setup.
---

# Unreal AI and Blueprint creator workflow

Use full Unreal Engine for standalone games and Blueprint gameplay. For a Fortnite
island, use the separate UEFN setup skill: UE plugins and gameplay graphs are not
assumed portable to UEFN. This skill provides setup and verification instructions;
Ootle Lobby does not currently execute Unreal Editor commands itself.

## Getting started

1. Inspect the project's `.uproject`, engine association, platform and plugins.
   Preserve the project's version. Existing vendored Unreal skills mention UE 5.8;
   that is a reference baseline, not permission to upgrade a project.
2. Install Epic Games Launcher from https://www.unrealengine.com/download and sign
   in. In its Unreal Engine library install the selected engine version, then open
   the project or create a small Blueprint template project. Check current hardware
   requirements. C++ projects/plugins also need the engine-supported Visual Studio
   toolchain on Windows or Xcode on macOS; Blueprint-only work may not need compilation
   of native code. Do not install every target SDK by default.
3. Read [tool selection and access](references/tools.md). Choose one assistant that
   supports the exact engine build and OS, rather than installing all of them.
   Account/entitlement, provider key, network access and project-indexing scope must
   be verified separately. A listed product is not an authenticated integration.
4. Install from the selected vendor's official guide/Fab listing. Enable its plugin
   in Edit → Plugins, restart when required, and verify it can identify the current
   project. Start with a read-only question about one known Blueprint. Do not upload
   private source to a new provider merely because indexing is offered.
5. Save/checkpoint the project before generated edits. Use an isolated map and
   `/Game/CreatorTrials/` folder for the first trial. Record engine/plugin versions
   and actual observed capabilities. No paid generation is required to read this skill.

## Blueprint-first acceptance trial

Start with one mechanic, not an entire level. Example brief:

> In a test map create BP_CreatorLaunchPad. Use an overlap trigger and Launch
> Character on the player, with editable launch strength and cooldown. Ignore
> non-player actors. Separate trigger logic from visual feedback. Explain the
> graph and list every changed asset. Do not alter existing maps or project input.

Ask for a node/component plan before edits. Use Blueprint Classes or Actor Components
for reusable logic, explicit variables and small named functions. Prefer events,
interfaces or dispatchers to hard-coded level dependencies and unnecessary Tick.
Inspect the actual graph: execution wires, typed data pins, valid references,
collision channels, cooldown/reset paths and exposed settings. Never fabricate or
text-edit binary `.uasset`/`.umap` files; use the Editor or a verified graph tool.

Compile every changed Blueprint, inspect errors/warnings and save. In Play In Editor,
check normal activation, rapid re-entry, non-player overlap and restart/reset. If
multiplayer is intended, test authority and replication with separate clients.
Capture the graph and gameplay. Reload the saved map to prove persistence. Report
compile success and observed behavior separately; an attractive graph is not proof.

If the assistant cannot edit graphs, fall back to a precise node recipe for the
creator to implement, explicitly labeled manual. Do not claim node text is a working
Blueprint. After two failed attempts, inspect the compiler/log evidence and fix the
smallest fault instead of generating a replacement game.

## Reuse the existing skills

In Hub Skills search `unreal`: Blueprint structure, Enhanced Input, behavior trees,
C++ gameplay, Niagara and packaging are already bundled. In an ootle-lobby checkout
these live under `skills/vendor/gamedev/skills/unreal/`. Download only the needed
bundles and retain their reference files. For voice use the existing audio/TTS
workflow; audition one line before generating a whole dialogue set.

## Ootle Lobby handoff

Create a project at `/create/project`, record the source repository/revision, engine
and plugin versions, brief and success criteria. Save `.uproject`, `Config/`,
`Content/`, `Source/` where present and redistributable required plugin source.
Use remote Git LFS or approved release storage for large assets; exclude generated
`DerivedDataCache/`, `Intermediate/`, `Saved/`, `Binaries/` and credentials. Document
how licensed dependencies are restored rather than copying account-private plugins.

Package and test a target build using the existing Unreal packaging skill. Attach
its remote download/demo link and a genuine capture/cover to the Hub project. A UE
native build is not a browser game; Pixel Streaming requires a separate hosted GPU
service and is not provisioned here. Fork the source revision and make a new Hub
project/version for a remix. Prove restoration on another agent's machine.

Tari L2 features use TARI. Wallets/contracts require their own implementation and
tests; a Blueprint score or local token animation does not establish a transaction.

Reviewed 2026-09-23. This publication verifies guidance and Hub discovery only;
no Unreal assistant account, plugin, graph generation, Editor build or deployment
was executed. Source links and tool-specific evidence are in references/tools.md.
