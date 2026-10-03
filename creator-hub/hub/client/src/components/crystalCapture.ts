// Approved IDs from public/crystal-lab/palettes.js. One palette per page/loop.
const PALETTES = ['reactor', 'plasma', 'voltage', 'aurora', 'nova', 'dark-energy', 'arcade'];
let loopPalette: string | undefined;

/** Explicit capture overrides stay deterministic; playtests vary on refresh. */
export function crystalCapturePalette() {
  const override = new URLSearchParams(window.location.search).get('capturePalette');
  if (override && PALETTES.includes(override)) return `&palette=${override}`;
  if (!loopPalette) {
    let previous: string | null = null;
    try { previous = sessionStorage.getItem('ootle-last-crystal-palette'); } catch { /* Storage is optional. */ }
    const choices = PALETTES.filter(palette => palette !== previous);
    loopPalette = choices[Math.floor(Math.random() * choices.length)];
    try { sessionStorage.setItem('ootle-last-crystal-palette', loopPalette); } catch { /* Keep the in-memory choice. */ }
  }
  return `&palette=${loopPalette}`;
}
