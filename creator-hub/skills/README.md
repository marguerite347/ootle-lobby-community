# TariSkills implementation

18 original native topics, a generated verified-only router, versioned source metadata and runnable examples. The hub serves a searchable `/skills` catalog and raw Markdown. All knowledge comes from these files; there is no separate content database.

## Validation boundary

Read [validation evidence](evidence/validation.json). Verified entries have a narrow recorded scope. Network publication, wallet signing, private transfers and wXTM interoperability are not certified by local tests. Drafts stay out of the generated agent router. Source checks and technical validation dates are separate.

The initial testnet release gate in CH-048 remains open until a funded configured testnet workflow has real transaction/template/component evidence. No new public site was deployed for this change.

## Use and reproduce

Start with [the generated agent router](SKILL.md), or browse [all topic metadata](catalog.json). For the full intended path, including drafts, read [start here](start-here/SKILL.md). Preserve this directory layout when copying the library into an agent's skill directory. Existing project instructions remain authoritative.

From the repository root:

```sh
python3 creator-hub/skills/scripts/catalog.py --check
python3 -m unittest discover -s creator-hub/skills/scripts -p 'test_*.py'
python3 -m unittest discover -s creator-hub/skills/examples -p 'test_*.py'
node --test creator-hub/skills/examples/transaction-state.test.mjs
cargo test --locked --manifest-path creator-hub/skills/examples/counter/Cargo.toml
cargo build --locked --release --target wasm32-unknown-unknown --manifest-path creator-hub/skills/examples/counter/Cargo.toml
```

The generated and HTTP routers share `router-header.md`; edit that header once to keep their instructions identical.

Run `scripts/catalog.py --write` after source or metadata changes. `scripts/check_sources.py` reports upstream HEAD drift without replacing instructions or claiming every upstream change invalidates a topic. If a change affects guidance, mark the skill stale and revalidate it. Git commits preserve prior versions.

## Routes

- `/skills`: searchable human catalog, with lifecycle and validation scope.
- `/skills/<topic>`: readable guide, copy control, raw/history/issue links.
- `/skills/SKILL.md`: verified-only task router generated from current metadata.
- `/skills/<topic>/SKILL.md`: authored Markdown, including explicitly labeled drafts.
- `/skills/revisions/<full-commit-sha>/<topic>/SKILL.md`: immutable raw skill content from that repository commit; requires Git history on the server. Missing revisions return 404.

A pinned raw file is not a self-contained installation: use the matching checkout/archive for its metadata, examples and relative references. Deployment-origin prompts are intentionally omitted until hosting is verified.

## Contribution template

Create `<topic>/SKILL.md` with `name: tari-<topic>` and a precise description. Copy an adjacent metadata.json, replace its identity, sources, supported versions and issue link, set lifecycle to draft and clear technicalValidatedAt/evidence. Write task, native concepts, runnable example or explicit runbook, expected outcomes, failure recovery and primary sources. Add the topic to coverage.json. Avoid invented sample addresses and unsupported API names.

## Open follow-ups

Live testnet release validation (#76), full browser-wallet integration (#69), network data adapters (#70), authoritative wXTM contract evidence (#71), and activation/feedback analytics (#75) remain separate work. Router/catalog implementation does not close these tickets. The example catalog UI is available in the app, not a claim of public deployment.

## Community publishing

The hub `/skills` entry now includes the community skills/workflow marketplace. The native reference catalog moved to `/skills/native`; individual guide, raw and revision routes remain unchanged. Community submissions are separate runtime content and never alter this verified-only router. See [the publishing standard and handoff](../hub/SKILLS_MARKETPLACE.md).
