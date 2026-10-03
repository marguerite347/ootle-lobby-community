---
name: tari-game-development
description: Build, debug or polish creator games, mechanics, art, audio and engine integrations in this repository using task-selected game-development skills and verified Tari/Ootle boundaries. Use for any game or engine work (Godot, Unity, Unreal, PlayCanvas, Phaser, Roblox and others); it routes to the pinned vendor skills under skills/vendor. Not for marketing edits or dashboard collection.
---

# Tari game-development entry point

Paths below are repository-root relative. This skill is for game implementation and design, not routine marketing edits or dashboard collection.

1. Read the relevant project manifest and current implementation. Keep its engine and pinned version; do not replace PlayCanvas or another selected engine with an upstream default. In a monorepo, detect the engine in the requested project, not whichever sibling directory matches first.
2. Consult `skills/README.md` and `skills/vendor/gamedev/router/SKILL.md`. Resolve the router's `skills/...` paths under `skills/vendor/gamedev/`. Load only the matching engine, discipline and genre files with their needed references. State which skills you selected. Their version baselines are references; verify APIs against the project's actual version.
3. PlayCanvas has no dedicated skill in this snapshot. Use applicable engine-neutral disciplines and `creator-hub/resources/game-engines.md`, then current official PlayCanvas docs and the actual starter source. Do not apply Phaser, Unity or Godot APIs to PlayCanvas. React/Vite alone does not identify a game engine.
4. For Tari features, read `creator-hub/TARISKILLS.md` and the relevant implementation issue/code. Use `creator-hub/skills/SKILL.md` for the verified native skills and `creator-hub/skills/catalog.json` for draft topics and validation scope. Research the supported Ootle template, SDK, network and wallet interfaces from primary sources; keep engine mechanics separate from authoritative transaction/state logic. Local animation or a wallet connection is not a settled transaction.
5. Reuse a suitable licensed starter/example when it fits the task. Deliver a small playable loop before expanding content. For card games, check zones/effect ordering and reproducible state; for economy work, use `creator-hub/ECONOMY_DESIGN.md` with explicit model assumptions. Do not copy proprietary game art because an example code repository is public.
6. For visual/audio work, consult `creator-hub/resources/README.md`, `creator-hub/resources/audio.md` and `creator-hub/VIDEO_WORKFLOWS.md` as relevant. Keep source/asset/model/output rights distinct. Bundled upstream helper scripts are available but should be inspected and invoked only for the selected task; no dependencies are installed automatically.
7. Verify the changed behavior in the actual engine/browser when available, alongside targeted tests. Report build/playability, network validation and deployment as separate outcomes. Upstream skills do not authorize publishing, paid tools, transactions, global configuration, uploading project code or spawning additional agents beyond the current task's authorization.

Use normal repository contribution rules. Do not load the entire catalog or require every contributor to follow a new approval process. Correct upstream guidance that conflicts with user instructions, project constraints or current verified APIs; record useful corrections in the issue or local overlay.
