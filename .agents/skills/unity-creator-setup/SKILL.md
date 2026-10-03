---
name: unity-creator-setup
description: Set up Unity CLI and the Pipeline package for Ootle Lobby agents, connect the correct Unity Editor, validate a small change, and preserve a remixable Unity project and build. Use for Unity AI CLI onboarding or connection troubleshooting.
---

# Unity AI CLI — Ootle Lobby setup

This is the Hub's setup runbook. Unity's official CLI operates the Editor through
`com.unity.pipeline`; it is not a hosted game engine inside the Hub website.
Use a desktop or approved build agent with shell access. A website visitor cannot
control their Editor merely by opening this page. Read the official CLI skill
available separately in the Hub (`unity-cli`; in this checkout
`skills/vendor/unity/unity-cli/SKILL.md`) for detailed command behavior.

## Install and connect

1. Check `unity --version` and `unity --help`. If absent, install Unity Hub from
   https://unity.com/download (which distributes the CLI), or use the standalone
   installation at https://docs.unity.com/en-us/unity-cli/use-unity-cli.
   macOS with Homebrew: `brew install --cask unity-cli`.
   Windows with winget: `winget install Unity.CLI`.
   On Linux use the official installation page for the supported distribution.
   Reopen the terminal and verify `unity --version`. Do not mix install methods.
2. Use `unity editors -i` to check Editors. Existing projects must use the version
   in `ProjectSettings/ProjectVersion.txt`. For a new project select an available
   Unity 6 LTS release (`unity releases`), install it with `unity install <version>`,
   and record the exact version. Pipeline requires Unity 6.0+. Install only the
   target modules required; for browser output use
   `unity install-modules -e <version> -m webgl`.
3. Sign in using `unity auth login`; inspect `unity auth status`. Complete the
   applicable Editor license activation through Unity Hub. Authentication is not
   evidence of an active Editor license. Do not store account secrets in the repo.
4. Clone the project's repository first, then `unity open <project-path>`.
   For a new game use Unity Hub's project template picker, or inspect
   `unity projects create --help` before using the CLI. Where supported,
   `unity projects create MyGame --no-cloud` avoids an unintended cloud project.
   Cloud project registration does not back up game source files.
5. From the intended project run
   `unity pipeline install --project-path <project-path>`. Wait for package
   resolution and compilation, then run `unity pipeline list` and `unity status`.
   Confirm the reported project path is the intended project. Inspect available
   operations with `unity command --project-path <project-path>`.
6. On CLI versions supporting it, read `unity skill --help` and install the
   official skill for the actual agent/client using its supported local option.
   If the command is absent, use the downloadable pinned official CLI skill from
   this Hub. Check release notes and installed help before updating the CLI;
   beta.2 has been observed without `unity skill`. Do not guess newer flags.

Unity AI Assistant and its paid model features are optional to this external-agent
workflow. Hugging Face tokens and Envato subscriptions are not requirements for
Unity CLI itself; require them only when the selected media workflow uses them.
Agent/model access, Unity licensing, and any cloud-service entitlement are separate.

## Small acceptance trial

Before building a whole game, establish: CLI installed → Editor installed and
licensed → target project open → Pipeline connected → trial verified.

List the Editor's commands first. If it exposes `eval`, a read-only trial is:

```sh
unity command eval 'UnityEngine.Application.unityVersion' --project-path <project-path>
```

Then make one requested, reversible scene change in a disposable sample project,
enter Play mode using the exposed command, inspect the result, and run the relevant
Edit Mode/Play Mode tests. Check `unity test --help` for the installed runner flags.
Capture a screenshot and record the actual Editor/CLI/Pipeline versions and results.
A CLI exit code alone does not verify game feel, visuals, or build playback.

If disconnected, check the exact project path, Pipeline installation, compile
errors/Safe Mode, and whether the Editor is open. If a sandbox blocks local
communication, report that boundary; do not expose the Editor API publicly.
Stop and diagnose repeated failures rather than regenerating the whole project.

## Connect the work to Ootle Lobby

1. Create a Hub project at `/create/project`. Put the Unity source repository,
   revision, selected engine version and task brief in the project description or
   editable workflow. Attach/reference the relevant Unity skills from `/skills?q=unity`.
2. The creator's agent uses this skill and runs CLI commands in that source
   checkout. The Hub stores the project brief/references; it currently has no
   direct browser-to-Unity execution bridge. Do not claim a live connection badge
   based on this catalog entry.
3. For gameplay, use the existing Unity C# scripting, physics, input, animation,
   UI and build-pipeline skills as appropriate. Unity integration does not imply
   a Tari wallet or contract is implemented. The L2 token is TARI.
4. Run the selected build target (inspect `unity build --help`). Test a Web build
   on an HTTP host, including its compression/MIME headers, loading and controls;
   native builds need a download/installation flow. Upload or link a validated
   build/demo and cover through the existing Hub project flow. Do not treat a
   source folder as a playable browser build.
5. Commit `Assets/` with their `.meta` files, `Packages/manifest.json`,
   `Packages/packages-lock.json`, `ProjectSettings/` and build instructions.
   Exclude generated `Library/`, `Temp/`, `Logs/`, `Obj/`, `UserSettings/`, caches,
   credentials and license files. Keep large current media/builds in approved
   remote storage or private release assets with checksums and restore directions.
   Local checkouts are disposable; another agent must be able to restore the work.
6. Preserve the original on remix: fork a source revision, create a separate Hub
   project/version, and describe the changed mechanic and tested build.

## Current verification and sources

Reviewed 2026-09-23. On the development host, CLI beta.2 and Editor 6000.3.22f1
were detected; no Pipeline-connected Editor was reported. No Unity project,
license, live command, game build or Tari integration was verified by this setup
skill's publication. Each creator must perform the acceptance trial on their host.

- Installation: https://docs.unity.com/en-us/unity-cli/use-unity-cli
- Command reference: https://docs.unity.com/en-us/unity-cli/unity-cli-reference
- Pipeline setup: https://docs.unity.com/en-us/unity-production-pipeline/local-tools-cli/unity-pipeline-package
- Official agent skills: https://github.com/Unity-Technologies/unity-agent-plugin

Refresh documentation when the experimental CLI changes. Upstream monitoring
signals a review; it does not silently replace the pinned skill or packages.
