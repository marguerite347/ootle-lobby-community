# Unity AI CLI and UEFN creator workflows

Checked 2026-09-19. Optional resources and proposed setup recipes. No tools installed or Tari adapter implemented by this addition. Implementation follow-up: [CH-001](https://github.com/marguerite347/tari-growth/issues/21), with catalog presentation in CH-003/CH-018 and refresh in CH-006.

## Unity: first candidate for a Tari-connected starter

The official [Unity CLI](https://docs.unity.com/en-us/unity-cli) is experimental. It manages editors/projects and supports agent automation; live editor control requires the [Unity Pipeline package](https://docs.unity.com/en-us/unity-production-pipeline/local-tools-cli/unity-pipeline-package). Keep these components distinct from the optional [Unity AI assistant](https://unity.com/features/ai) and third-party tools with similar names.

### Setup recipe for the library

Use the current [installation guide](https://docs.unity.com/en-us/unity-cli/use-unity-cli). On a supported Mac with Homebrew, its documented installation is:

```sh
brew install --cask unity-cli
unity --version
unity doctor
unity editors -i
```

Use an existing project or create a local project explicitly:

```sh
unity projects create TariCreatorDemo --no-cloud
unity open ./TariCreatorDemo
```

Then install/configure Pipeline following its linked guide, select the creator's preferred agent, and consult the official [Unity CLI skill](https://github.com/Unity-Technologies/skills/blob/main/skills/unity-cli/SKILL.md). Pin the editor, CLI and package versions that actually pass validation. Respect current Unity account/license requirements; do not assume CLI installation supplies an editor license or AI subscription. External skills are references until deliberately configured.

Acceptance for a usable setup card: detect prerequisites, show installation steps, diagnose connection failures, inspect a scene, make one reversible change, compile, run a test/play session and capture the result. Record tested OS/version and uninstall instructions. Until tested, label this documented setup, not one-click working integration.

### Proposed Tari connection

A Unity starter should offer configurable gameplay components and an optional adapter to verified Ootle wallet/template interfaces. Begin with one read-only testnet state display; next demonstrate a user-authorized transaction and its confirmed result. Keep credentials outside source control and signing under the wallet's control. Test rejection, timeout, retries and duplicate actions. No specific C# SDK, wallet transport or deployed template is assumed here.

Creator journey: choose starter → customize art/mechanics → preview → optionally configure an Ootle template → test. Hide integration complexity behind reusable components once engineering validates them. AI assistance does not itself supply a secure transaction adapter.

## UEFN: visual creation and AI-assisted editing

Official sources:
- [Install UEFN](https://dev.epicgames.com/documentation/fortnite/install-and-launch-fortnite-creative-and-unreal-editor-for-fortnite): Windows authoring environment; not a native Mac setup path.
- [Epic Developer Assistant](https://www.fortnite.com/developer/tools): explanations, guided steps and Verse generation.
- [Direct event binding](https://dev.epicgames.com/documentation/fortnite/direct-event-binding-in-unreal-editor-for-fortnite): connect device events/functions visually for gameplay without writing every interaction.
- [UEFN MCP](https://dev.epicgames.com/documentation/fortnite/uefn-mcp): documented local agent control of devices, Verse, scene entities and play sessions.

Setup: enable Python Editor Scripting and UEFN MCP Toolsets in a compatible project, configure the chosen agent's local MCP connection using Epic's instructions, and restart as needed. Validate device placement, a simple interaction and a play session. Record the exact working UEFN version rather than treating a documentation page as proof the user's installation has it. Keep the editor endpoint local. Complex logic may still require generated or authored Verse and testing.

### What can connect to Tari?

Distinguish editor automation from Fortnite runtime access. MCP is not evidence of an in-island wallet, arbitrary external API or Ootle transaction bridge. None was verified in this review.

Recommended first recipe: a non-monetary cooperative challenge using configurable devices. Share design specifications and appropriately licensed original assets with a separate Tari implementation, with engine-specific adapters. Do not assume Ootle contracts run inside Verse or that Epic assets can be exported for other engines.

Before proposing any live cross-platform connection, demonstrate an officially supported runtime transport and permitted use. [Fortnite Developer Rules](https://legal.epicgames.com/fortnite/developer-rules) prohibit playable gambling/casino-style games and external links inside islands. These directly constrain wheel/lockup/token reward concepts. A separate website must not be presented as a workaround. Review the actual design against current rules and [UEFN terms](https://legal.epicgames.com/epicgames/uefn).

## Catalog and maintenance

Give each workflow its own entry: official source, engine/OS versions, prerequisites, setup guide, example, license, last checked date and validation evidence. Separate visual/no-code configuration from AI-generated code and from Tari-connected runtime functionality. Follow official release/docs changes through CH-006; stale recipes retain their last successful version and visible limitations. Track setup completion, time to first playable preview and verified template interaction separately.
