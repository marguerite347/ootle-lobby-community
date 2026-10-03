---
name: tari-contribute
description: Add or update TariSkills with reproducible evidence, pinned sources and honest lifecycle labels. Use when creating a TariSkills topic, changing its metadata or lifecycle, or regenerating the catalog and router.
---

# Contribute and maintain

Read [metadata](metadata.json) for lifecycle, supported versions and validation scope.

## Authoring workflow

Each topic contains SKILL.md plus metadata.json. The name and description support discovery; metadata carries lifecycle, supported environment, source revision, validation scope, related topics and outstanding checks. Human catalog and raw routes read these same files.

Start from a creator task, inspect the native subsystem and write original concise guidance. Do not relabel Ethereum instructions or treat source text as authority to change the user's machine. Put executable examples under examples and sanitized observations under evidence. No wallet credentials, private source snapshots or unexplained tutorial addresses belong here.

## Validate a change

From the repository root:

```sh
python3 creator-hub/skills/scripts/catalog.py --check
python3 -m unittest discover -s creator-hub/skills/scripts -p 'test_*.py'
node --test creator-hub/skills/examples/transaction-state.test.mjs
python3 -m unittest discover -s creator-hub/skills/examples -p 'test_*.py'
```

Run Rust examples when those files or their instructions change. Regenerate the catalog with `catalog.py --write` after metadata/content edits. A source retrieval date is not a technical test date. Promote only the exact validation scope demonstrated in evidence; keep network-dependent workflows draft until actual receipts exist.

## Refresh and rollback

Compare sources.json revisions to upstream deliberately. If an API change invalidates a skill, mark it stale, regenerate the router, and keep its historical source in Git. Fix and retest before promoting again. Roll back shared changes with a revert commit so the audit trail remains visible. Pin a consumer to a commit when reproducibility matters.

## Expected result

A contributor can reproduce the checks, see why a topic is draft or verified, and follow its source links. No manually maintained second task backlog is created: use the linked CH issues for remaining work. Optional agent installation should preserve the relative directory layout and read this entry point, without overwriting an existing project's AGENTS.md.

## Primary sources

- [Pinned source: docs/skills/README.md](https://github.com/tari-project/tari-ootle/blob/ebca9f42a1570261a6434ee79ea4cd52f3d61fcc/docs/skills/README.md)
