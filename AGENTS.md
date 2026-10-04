# Public Ootle Lobby website

This repository contains the website source and reviewed community content. Keep changes scoped to public site functionality and content. Never add credentials, runtime chat/user data, unrelated private application files or local caches. Preserve upstream notices with reused files; do not create a separate license folder.

Project-card content lives in content/projects/. Validate it with npm test and npm run validate. Website source lives in creator-hub/hub/client and creator-hub/hub/server. Use npm run build:site to build the actual app and deployment package. Content proposals and website changes use reviewed pull requests. Publishing occurs only from main after review; do not claim a proposal is accepted or live before the respective steps succeed.

For endpoint, provider, storage or simulated-feature changes, update `docs/integration-gaps.json` and matching `INTEGRATION_GAP[ID]` source comments. Regenerate `docs/DEVELOPMENT_GAPS.md` with `node scripts/check-development-gaps.mjs --write`. Distinguish implementation gaps from configuration and intentionally retired routes; do not declare an integration complete without its documented completion evidence.
