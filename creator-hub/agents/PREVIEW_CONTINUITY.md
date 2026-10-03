# Preview continuity — all agents

User-required: keep active preview connections available throughout authorized work. Explicit user stop orders override continuity. This is local preview supervision, not production cloud hosting or authoritative cloud storage.

- One named operator owns listeners and supervision. Coordinate before changing them; do not run competing keepalive scripts.
- Use a supervisor independent of agent command lifetime. Restart only exited processes; do not kill a healthy listener on a single failed request.
- Preserve each runtime directory and media mapping. Never reseed, switch data roots, clear identities or overwrite projects to repair availability.
- Prepare and validate changes before the shortest necessary backend restart. Verify page, relevant API, media and actual rendered state after replacement; keep a known-good rollback. Frontend-only changes usually need no server restart.
- Report outages promptly with owner, concrete cause and repair. HTTP200 is availability evidence, not creative acceptance.
- User-requested shutdown must unload the supervisor first, so it cannot resurrect stopped work.

## Local preview services

Preview ports, supervisors, checkout paths and runtime data directories are machine-local and are not recorded here; the old instance's Mac LaunchAgents and `/tmp` checkouts were not carried into this repo. Run a preview from this checkout (`creator-hub/hub`, see its README) with its own `CREATOR_HUB_DATA_DIR`, and record the port and owner in the task handoff.
