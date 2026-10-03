# Create design pass, 21 September 2026

The previous landing page placed an asset panel before starter choice, followed by a long catalog that buried native compositions and guided setups. Create now has three mutually exclusive starting paths: game frameworks, guided setups, and Tari compositions. A shared tools row keeps asset discovery/upload and video preparation reachable from every path. Existing project, recipe, resource, asset and video routes remain unchanged.

The `view` URL parameter selects the path. Missing/unknown values fall back to frameworks, preserving existing genre/engine/kind/search deep links. Switching paths preserves those filters. The game browser initially displays six records, with Show more retaining access to all records. Individual filter-removal buttons and retry controls improve recovery. Both async loaders ignore responses after unmount.

This is an entry-page redesign, not a new game runtime, automatic fork service or deployment system. Keep the existing source, license, verification, adapter and preview labels intact. Recipe execution remains explicitly unverified where the API says so.

Validation: existing hub suites and production build; browser checks for path switching, guided routes, genre deep links, filter removal, mobile/tablet layouts and overflow. Changes are scoped to Create.tsx, GameStarters.tsx and Create.css. Future contributors should preserve the single project/workflow model rather than introduce a separate studio.
