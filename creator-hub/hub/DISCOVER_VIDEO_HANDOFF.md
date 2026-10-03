# Discover video coverage: current handoff

Follow [VIDEO_PREVIEW_POLICY.md](../VIDEO_PREVIEW_POLICY.md). Every item needs bespoke animated album artwork about its particular purpose, with an original concept, composition, imagery and motion. Creative feature illustration is intended. Literal UI replication is not required.

The historical DiscoveryCover batch renderer repeated a few motifs and is retired. `render-discovery.mjs` now reports missing previews; it does not render replacements. `npm run previews` can capture webpages and assemble existing recordings, but does not fulfill the bespoke art backlog.

Review existing AppCover feature illustrations individually. Abstract or generated does not mean generic. Accept distinct artwork relevant to the resource under the documented review manifest; reject recycled scenes. Do not hide an entire class of illustrations solely because they do not resemble the UI.

On 2026-09-21, all 157 current catalog resources received individually authored, visually reviewed animated artwork. All 157 MP4s and posters were installed on the local 4189 preview. The API returned 157 distinct album-video paths, and all 314 media URLs served successfully. Original webpage captures remain on disk. Future catalog additions need new scenes and review; this count is a dated snapshot.

Implementation: [Album artwork runbook](../video-templates/ALBUM_ART.md), [per-resource review records](../video-templates/reviews/album-art-2026-09-21.json), and [decoded-frame audit](../video-templates/reviews/media-audit-2026-09-21.json). PR #101 addresses issue #100.

Validation: 17 video-template tests, TypeScript checking, 97 server tests and 21 client tests passed. Every MP4 decoded to 96 frames at 24 fps, 640×360, with real frame variation. Posters and opposing motion frames were visually inspected across the collection; Airdrop cropping, Hades geometry, text escaping and loop discontinuities were corrected before the final render. Actual Discover and Learning-category cards were inspected in the browser and visible playback time advanced.

Review corrections: commit b9fdede expanded render fingerprints from sampled frames to full scene/shared source plus settings, and stages/verifies file copies before atomic publication. An independent re-review found no remaining blockers. Rendering now fails with a named list of resources lacking authored scenes. Local workflow references point to their repository documentation rather than relative app routes.

This is installed local preview media, not a new public deployment. Source artwork and review evidence are committed; binaries remain runtime artifacts reproduced using the runbook.

Publish immutable MP4/poster filenames in the runtime previews directory and atomically update catalog-index.json by exact resource ID after visual review. Preserve original catalog media. Video binaries remain outside Git. The host needs the artifacts; merging code alone does not install artwork.

Verify the actual Discover card crop, subject relevance, distinction from other covers and full loop playback. Report separately what was authored, reviewed, installed locally and deployed. Respect reduced motion and pause offscreen video. Never label illustration as gameplay.
