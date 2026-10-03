# Discover design pass

Discover now uses a full-width video gallery, clear resource-category buttons, persistent ecosystem/readiness selectors, individually removable filters, and a contextual Create link. Cards use article containers with separate detail, star and popularity controls, avoiding nested links from the previous card wrapper. Video playback, cover attribution, readiness and source access remain intact.

The small current catalog is fetched once; discovery.ts handles local filtering and ordering. Native/type/ecosystem/readiness/search/sort URLs remain usable, browser navigation syncs the search field, and 24-item batches reduce the number of video elements loaded at once. Errors have retry controls instead of masquerading as zero results. Empty results preserve all filter options.

For a substantially larger catalog, implement server pagination with independent stable facets before abandoning the current local index. Preserve the single Discover → Learn → Create → project workflow. This changes no recording, upload, wallet or deployment behavior.

Validation: filter regression tests, existing hub tests, production build, desktop/mobile browser inspection, category selection, empty-state recovery and visible video playback. Code and review notes are tracked in the accompanying PR.
