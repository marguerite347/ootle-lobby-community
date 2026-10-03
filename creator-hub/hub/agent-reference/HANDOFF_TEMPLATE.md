# Handoff template

Copy this into `HANDOFF.md` at the root of the game (or paste it to the creator)
at the end of every session. A fresh agent should be able to continue from it
alone, without this conversation.

Status words, used exactly: **proposed** (described, not built) · **built**
(code exists and runs) · **played** (someone played the real loop in a browser)
· **published** (listed on this Lobby) · **deployed** (reachable on a public
host). Never use a stronger word than what actually happened.

```markdown
# <Game title> handoff

Date: <YYYY-MM-DD> · Agent: <name/model> · Lobby: <origin>

## Goal
<One or two sentences: the player experience the creator asked for, in their words.>

## Status
- Overall: <proposed | built | played | published | deployed>
- Project: <project id and URL, if saved on the Lobby>
- Source: <repo + commit, or archive + checksum>
- Play: <URL or command that starts it>

## What works (and how you know)
- <Behavior> · <how it was checked: device, browser, settings, date>

## What's broken or missing
- <Issue> · <how to reproduce> · <likely cause if known>

## Decisions to keep
- <Choices the creator made or approved that later changes must respect.>

## Run it
- Setup: <prerequisites, pinned versions, env var names (never values)>
- Commands: <install, dev, build, test, playtest>

## Assets
- <path> · <source URL or "original"> · <license> · <in Git / LFS / elsewhere>

## Next step
<The single most useful next action, and who owns it.>
```
