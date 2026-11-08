# Counter dependency patch

The shared-buffer 0.1.4 source and licenses are reused from the maintained Workbench counter example. Only its memmap2 dependency is pinned to the repaired 0.9.11 release for RUSTSEC-2026-0186. Cargo.toml.orig preserves the upstream requirement.

The example now uses tari_template_lib 0.38.0 and tari_template_test_tooling 0.50.1, with the same lockfile as Workbench. Linux CI runs its actual owner/public-reader/denied-writer and rollback tests, then builds release WASM. This does not establish network or broader authorization safety. The November 3 upstream advisory assessment records remaining engine and built-in governance issues with no published compatible fix.
