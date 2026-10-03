// Pure helpers for app "album cover" generation. Deterministic: the same app name
// always yields the same accent and monogram, so covers are stable across renders.

export function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`;
}

// A vivid, distinct accent per app name (fixed saturation/lightness for on-screen pop).
export function accentFor(name) {
  const hue = hashString(String(name)) % 360;
  return hslToHex(hue, 68, 56);
}

// Two-character monogram: initials of the first two words, else first two alphanumerics.
export function monogram(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return String(name).replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?';
}

export function fullHex(color) {
  return /^#[a-f0-9]{3}$/i.test(color) ? '#' + color.slice(1).split('').map(c=>c+c).join('') : color;
}
export function coverSlugs(apps) {
  const slugs=apps.map(app=>String(app.name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''));
  if(slugs.some(s=>!s)||new Set(slugs).size!==slugs.length)throw new Error('App names need unique nonempty filename slugs.');
  return slugs;
}
