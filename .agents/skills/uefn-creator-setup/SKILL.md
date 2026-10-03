---
name: uefn-creator-setup
description: Choose and set up the Fortnite island workflow with UEFN, devices and Verse; translate Blueprint gameplay concepts into supported devices, playtest in Fortnite, and preserve a Ootle Lobby project handoff. Use for UEFN or Fortnite creator projects, not standalone Unreal game packaging.
---

# UEFN creator workflow

Choose UEFN for experiences distributed within Fortnite. Choose full Unreal Engine
for standalone games with Blueprint gameplay and custom C++ plugins.

Epic documents that UEFN shares Blueprint objects in some asset systems, but does
not offer Blueprint visual scripting for custom gameplay. Use Creative devices and
Verse. Do not import an arbitrary UE gameplay Blueprint/plugin and promise it works.
This is current capability guidance, not a prediction about future engine releases.

## Setup

1. Use a supported Windows machine with Epic Games Launcher, an Epic account,
   Fortnite and UEFN installed from the official Launcher library. On a Mac,
   prepare briefs/assets/code as appropriate, but use a supported Windows host for
   the Editor; do not claim this Mac has a running UEFN environment.
2. Follow Epic's installation requirements linked below. Open an island template,
   configure revision control/team ownership, and establish a checked-in baseline.
3. Use the installed UEFN's Verse tools and API digests to select device APIs. An
   external agent can help author `.verse` files, but a plain-language prompt is
   not proof of compilation or a live editor bridge. Unreal AI plugin support
   needs an explicit vendor UEFN compatibility statement and a verified trial.
4. Build Verse, place/configure the device and its editable references, then Launch
   Session and test in the Fortnite client. Check logs and runtime errors.

## Blueprint concepts → UEFN implementation

| Full Unreal concept | UEFN starting point |
| --- | --- |
| Actor overlap/event graph | Supported trigger/device event and Verse subscription |
| Editable Blueprint variable | Supported device setting or Verse editable property |
| Dispatcher/interface-driven interaction | Device events and Verse functions for the supported API |
| Blueprint launch pad | Existing movement device first; Verse only for missing orchestration |
| PIE test | Launch Session in Fortnite and test with the intended players |
| Standalone packaged executable | Fortnite island publishing workflow |

Mappings are design prompts, not automatic node conversions. Verify each API with
the current project digests. Avoid generated syntax from an unrelated engine version.

## First playable trial

Build a three-checkpoint traversal challenge with a reset and visible completion.
Start with stock devices; add Verse only where necessary. Verify checkpoint order,
repeated triggers, death/reset, player join/leave and two-player state isolation.
Build Verse with zero errors, playtest in Fortnite, inspect memory/project validation
and capture actual footage before generating more content. Keep simulation state
separate from any proposed external Tari integration.

## Fit with Ootle Lobby and Tari

Use the Hub to discover resources, save the design brief, discuss/remix the concept
and showcase a verified island link and capture. It does not host the Fortnite
runtime or automatically publish islands. UEFN is a candidate for community games
and creator education; a native Tari wallet, TARI economy or arbitrary external
checkout inside an island is not implemented or assumed supported. Check current
Fortnite developer rules and supported APIs before designing any such integration.

Use Epic's supported revision control as the island source of truth. Store the Hub
brief, Verse source where appropriate, project ownership/restore directions and
capture references in the authorized repository. Preserve required assets remotely;
never leave the only copy on a creator's computer. Do not run competing revision
control systems over the same working directory. A Hub remix is not automatically
an Epic island ownership transfer or a clone of someone else's island.

Publication goes through Creator Portal with current eligibility, validation,
rating and moderation requirements. A test session or private version is not a
public release. Save the island's actual status and link in the Hub.

## Sources and verification

Reviewed 2026-09-23; no local UEFN installation, Verse compilation, Fortnite session
or publishing was executed by adding this skill.

- Epic engine comparison: https://dev.epicgames.com/documentation/en-us/fortnite/uefn-vs-ue-in-unreal-editor-for-fortnite
- Installation: https://dev.epicgames.com/documentation/fortnite/install-and-launch-fortnite-creative-and-unreal-editor-for-fortnite
- Verse devices: https://dev.epicgames.com/documentation/en-us/fortnite/create-your-own-device-using-verse-in-unreal-editor-for-fortnite
- Developer rules: https://legal.epicgames.com/fortnite/developer-rules
- Creator Portal: https://create.fortnite.com/
