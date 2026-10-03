# From a playable game to a discoverable Lobby project

A working HTML folder and a published Lobby project are separate milestones. There
are currently no published games: the earlier curated games, their registry and the
`games:publish` script were removed in the 2026-09-26 fresh start, and a new
registration path is being designed alongside the new creation tooling (see
`docs/PLAN.md`). The original-game path below still applies; it does not upload
arbitrary executable games or deploy to a public host.

1. Follow `hub/AGENT_START.md`, get a contextual build toolkit, and record the skills
   actually read, assets/packages selected, access checks and first playable trial
   in the game's `BUILD_PLAN.md`. Skip unsuitable recommendations with a reason.
2. Build in your own workspace. Keep editable source together: `index.html`, relative
   assets, `README.md`, `CREATOR_REPORT.md`, and a bespoke `cover.svg`. Preserve
   tests beside the game. Do not add tokens, private logs or machine-only URLs.
3. Review the actual start → play → outcome → retry loop, keyboard/touch behavior,
   small screens, sound toggle and reduced motion. Mechanics tests supplement
   browser play; they cannot establish whether a human finds it fun.
4. Hand the reviewed package (source, lockfile, licenses, asset credits, build
   command, tests and evidence) to a maintainer. Registration on the Lobby is a
   maintainer step and stays blocked until an owner performs and verifies it.
5. After registration, open the resulting project and play link on the actual server
   and check the cover visually. A local preview is not a production deployment.

## Cover expectations

The project viewer supports an illustrated cover without a video. An agent should
not abandon publication because an MP4 has not been rendered. Make the illustration
bespoke, describe it honestly as cover art, and never substitute it for evidence of
real gameplay. The Discover animated-cover policy in `VIDEO_PREVIEW_POLICY.md`
still applies; a static illustration does not complete that animation requirement.
SVG motion should respect reduced motion. Real captured gameplay is an additional
media deliverable and must satisfy the capture policy.

## Portability

Tracked game source is not a backup of private creator history. Use the
approved cloud migration/restore design for real user state; never commit runtime
project stores, management keys or personal data. Existing local data remains
migration-only until cloud cutover.
