# PR #83 review handoff

Reviewed starting commit `cae84d6080cf1f0cf7bb7aec23a5cdc16f7dc46a` for the internal local prototype. User confirmed licensing review should not hold this code push. This does not claim private use changes license terms.

## Fixes and rationale

- Replaced broken npm commands targeting nonexistent ShortPromo/WidePromo/SquarePromo compositions with the three real composition names.
- Render from a validated temporary props snapshot using the package-local CLI and entry point. Caller-relative props/output paths now work from other directories, including the documented ComfyUI directory. The manifest hashes the exact validated render input. Existing output/manifest paths are refused to avoid silently replacing clip revisions; temporary inputs are cleaned up after success/failure.
- Added optional REMOTION_BROWSER_EXECUTABLE support for installed Chrome. No implicit npx package download is needed after npm ci.
- Restrict this local prototype to media paths under public/ and require a source for image/video backgrounds. Reject traversal and malformed/credential-bearing destination URLs. Authorized remote asset ingestion belongs to CH-027, not arbitrary URLs executed by the renderer.
- HF generation accepts HF_TOKEN as well as HUGGINGFACE_TOKEN. Validate arguments before sending a request, bound dimensions/steps, time out, make exactly one explicitly opted-in potentially billed request, reject invalid PNG responses, preserve output revisions, and hash output bytes in provenance. Provider model revision is explicitly unknown. No retry is made after an ambiguous failure that may already have cost money.
- Replaced the invented lowercase-t icon with clearly documented text-only Tari identification. Example copy no longer asserts that Private Ballot or token-reward integrations are verified. The default badge says Template preview.
- Reserved title/body space separately from the badge and CTA and added measured fitting after square-format inspection found body/CTA overlap. Long destination links wrap.
- Mark ComfyUI as an unvalidated SDXL still-image API recipe. The runtime pin is null with validation state, not a fictitious tested commit. Updated HF CLI instructions and generation examples. Generated media is ignored under public/ except the checked-in fixture.

## Responses to the implementation agent's questions

1. License: retain informational notes; no licensing hold on this internal prototype push. Hosted use is not implemented or approved here.
2. Model: retain the current SD3 hosted example and draft SDXL graph as separate options; no claim of a single validated production model. Model/terms standardization can happen with runtime selection.
3. Budget: both paths remain optional. No hosted requests were made in this review. The opt-in authorizes one attempt, not an enforced dollar ceiling. A real cost estimator/cap is still required for a hosted worker.
4. Type: retain Poppins as the prototype face, do not bundle unprovided Druk assets. The official logo asset remains a follow-up.
5. Scope: keep the three templates and all three formats. Timed subtitles, audio, trim/crop controls and export-package extras remain CH-028 follow-ups rather than pretending text overlays are captions.
6. IDs: preserve the current metadata keys for this CLI manifest. A schema adapter to canonical clip revisions, publication records and analytics is still needed before live attribution; carrying IDs does not establish a working funnel.
7. Compute/storage: keep local generated files ignored. No GPU host or object-storage provider selected, provisioned or billed by this change.

## Validation and remaining work

- Unit tests cover shipped props/defaults, malformed URLs, invalid/local media paths, explicit generation opt-in, bounded arguments, single-attempt errors, output immutability and provenance with mocked HTTP.
- TypeScript check passes.
- Real 3-second, 1080x1080 H.264 render from outside the package using minimal props; ffprobe confirmed 90 frames and the wrapper emitted its manifest. Reusing the filename was refused.
- All three templates rendered as stills in portrait, landscape and square. Square CTA overlap found and corrected; revised square frames inspected with CTAs visible.
- No live ComfyUI execution or billed HF generation in this review. The original agent's SD3 demo is reported evidence, not independently repeated here.

This is a CLI renderer increment, not completion of #56. Remaining: official brand asset, timed captions/SRT, audio, thumbnail/copy export package, trim/crop UX, durable queued worker, progress/cancel/retry/idempotency, provider cost control, tested ComfyUI pin and editor-export workflow, and in-hub Make a video integration. Keep #56 open.
