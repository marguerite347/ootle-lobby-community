# Learn library redesign, 21 September 2026

Learn previously repeated discovery cards across topic groups, removed alternative facet choices after filtering, and could display a nonzero count with no visible topic results. The revised screen uses compact reading rows, Tari-first starting points, persistent selectors, individually removable filters, accurate unique counts, and an actionable empty state.

Implementation: `client/src/pages/Learn.tsx`, scoped `Learn.css`, and pure `learnLibrary.ts` selector. The current small learning index is fetched once from `/api/learn` without filters. Filtering and deduplication happen locally; server API semantics remain unchanged for other consumers. Topic membership comes from the API's grouped lists. Browser back/forward restores search and selectors. Unmounted requests cannot overwrite the view. A retry control handles fetch errors.

For future scale, move filtering/pagination to a server response with stable global facets and an explicitly filtered, deduplicated count. Do not restore facets computed solely from the remaining matches. Avoid oversized preview cards for textual documentation. Preserve direct resource detail links, source attribution, external-resource labeling and freshness warnings. Do not imply wiki ingestion is complete: this change imports no new content.

Validation: hub server and client suites, TypeScript/Vite production build, browser checks of the original advanced/reference/PlayCanvas URL, filter clearing, topic selection, empty results, navigation and responsive layout.

Independent review caught an author/category search regression during the move from server filtering. Restored both searchable fields and added regression coverage before merge.
