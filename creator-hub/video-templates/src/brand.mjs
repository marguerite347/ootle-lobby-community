// Approved *public* brand tokens, extracted from the marketing plan v2 (public guidance only).
// Source: docs/reference/marketing-plan-v2-import.md — "Brand Identity & Palette".
// The private brand document is NOT shipped here; only these published values are used.
//
// Display typography in the brand kit is Druk (primary) + Poppins (secondary). Druk is a
// proprietary licensed typeface and is intentionally NOT bundled. We render with Poppins
// (SIL Open Font License) so this template is redistributable. Swap in a licensed Druk
// build locally if your operator has the license.

export const BRAND = {
  colors: {
    cloud: '#ECEEFF',
    ink: '#040723',
    purple: '#813BF5',
    green: '#C9EB00',
  },
  // Motif emoji from the plan (campaign body copy only). Kept out of headings by convention.
  motifs: { turtle: '\u{1F422}', heart: '\u{1F49C}' },
};
