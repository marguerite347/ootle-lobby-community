# Canonical Tari terminology

Names and tokens only. Voice lives in [BRAND.md](BRAND.md); colours, type and components live in the [design system](design-system/README.md).

Confirmed by the project owner on **2026-09-23**:

| Context | Use |
| --- | --- |
| Tari L2 / Ootle token | **TARI** |
| Tari L1 token | **XTM** (unchanged by this correction) |
| Network / platform names | **Tari**, **Ootle** |

**XTR is an obsolete name for the L2 token. Do not use it as current terminology.**
This project-owner correction takes precedence over older documentation, New Lore
answers, catalog descriptions and other resources that repeat the old name.

## Apply the correction

Use TARI in authored UI, challenge briefs, marketing scripts, educational resources,
skills and technical explanations. When importing older resources, correct the
Hub-authored description and flag the source's terminology as outdated. Preserve
original URLs and literal upstream code identifiers needed for interoperability;
never change a URL just to make its spelling current. Quoted historical names must
be explicitly identified as obsolete. Do not silently modify vendored upstream code.

This decision establishes a **name**, not tokenomics, a conversion mechanism,
contract addresses, mainnet readiness, or transaction behavior. Those require their
own implementation evidence. Unrelated machine-learning terminology with the same
letters is unaffected.

## Regression check

`python3 scripts/check-token-terminology.py` checks tracked first-party text for the
obsolete token name outside URLs, this canonical correction document, and the
checker's own fixtures. CI runs it for pushes and pull requests. Vendored upstream
files are excluded to preserve their original bytes and unrelated technical names.
This catches textual regressions; agents must still interpret quoted historical
sources and verify technical behavior independently.

## Riff product naming

A **Riff** is a creator’s own take on an existing game or project. Use **Riff** (singular), **Riffs** (plural), **Create a Riff**, **Play this Riff**, and **Community Riffs** in product copy. Example: “Check out my Riff on [game title].” Describe the process as remixing components when helpful; the resulting product is a Riff. Avoid “remix” as the product noun and “Riff’s” as a plural.

Keep existing `remix` API routes, storage fields, event names, asset paths, filenames and saved project identifiers compatible. They are legacy technical names, not the product vocabulary. Do not rename user-authored project titles or rewrite third-party licenses and historical source quotations. Update current UI, default generated names, agent instructions and editorial copy together.
