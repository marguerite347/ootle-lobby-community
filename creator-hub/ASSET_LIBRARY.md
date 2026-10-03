# Assets in the creation journey

Open **Create → Choose or create assets**, or open a saved project and choose **Open asset library**. The library separates asset packs/libraries, individual game assets and asset creation workflows. It projects existing catalog records and includes the ComfyUI and video workflows. Asset-related resources are excluded from the game-starter projection; they remain searchable through general discovery.

From a project, **Add to project** saves the reference and a workflow node in a new Git version. It does not download or install dependencies. Save unsaved project edits before leaving for the library. Attachment uses expectedHead, so concurrent saves fail instead of silently overwriting work.

## Uploads
Creators supply a title, category, description, attribution, reuse terms and a permission declaration. PNG/JPEG/WebP/GIF, WAV/MP3/OGG, GLB, ZIP and JSON files up to 10 MB are accepted. JSON syntax is checked; other files are opaque downloads, not certified media. No archives are extracted, scripts run or file previews generated. External catalog thumbnails remain available.

Uploaded records immediately join the shared library, resource search and resource details on this hub instance. Files are always served as downloads with nosniff. Attribution and permissions are submitter declarations, not verified identities or grants.

## Storage and operations
- Files and metadata live in `CREATOR_HUB_DATA_DIR/assets/<upload-id>/`, or `creator-hub/hub/data/assets/` by default. This runtime directory is ignored by Git.
- The metadata holds attribution, reuse terms, timestamp, byte count and SHA-256. Each upload is written to staging then atomically renamed, avoiding partial visible entries. Concurrent uploads use distinct UUID directories.
- Back up the entire assets directory together with project runtime data. Restoring only Git source does not restore uploads.
- Current scope is the private local hub. Everyone who can access its server can browse, upload and download; no new user authentication was introduced. A public multi-user deployment needs authentication, quotas/rate limits, moderation and durable object storage before exposing this service. Current files are not malware-scanned.

## Agent interface and maintenance
`GET /api/assets` returns the category projection. `POST /api/assets` accepts JSON: title, description, creator, license, kind (`asset`, `pack`, `workflow`), rightsConfirmed, filename, base64. The decoded limit is 10 MB; route body limit is 14 MB. Response is the created resource. `GET /api/assets/:id/file` downloads the original bytes.

Use existing IDs when attaching resources. Fetch project state and head, preserve all fields, add the resource to components and workflow if absent, then publish with expectedHead and a useful version message. Do not retry conflicts blindly. Read WORKFLOW_AGENT_GUIDE.md for graph boundaries. Never put uploaded binaries or private source files in the source repository.

Tests cover upload, persistence, catalog visibility, download bytes/headers, rejected payloads and classification. Further work includes thumbnails for uploaded media, larger file/object-store uploads, ownership/moderation controls and finer asset metadata filters.

## Proposed generation workspace

[Development plan](AI_ASSET_GENERATOR_IMPLEMENTATION_PLAN.md) maps Scenario, Rosebud and Meshy creator flows to project-aware recipes, Hugging Face/open-model workers, fal Meshy and OpenRouter connections. Includes UX, provider boundaries, evaluation, backlog and unresolved access. Proposed, not connected runtime functionality.
