import upstream from './upstream.json';
import upstreamLicense from './UPSTREAM_LICENSE.txt?raw';

export const SOURCE_LICENSE = upstreamLicense;

export const GUESSING_TEMPLATE_ID = 'tari-ootle:starter:examples-guessing-game-template';
export const GUESSING_GUIDE = 'https://ootle.tari.com/guides/build-a-guessing-game/';
export const SOURCE_REVISION = upstream.revision;
export const SOURCE_URL = upstream.sourceUrl;
export const EDITABLE_FILES = ['src/lib.rs', 'Cargo.toml', 'tests/test.rs', 'build.rs', 'tari.config.toml'] as const;
export type SourceFile = typeof EDITABLE_FILES[number];
export type RiffSettings = {title: string; prompt: string; prizeName: string; maxPlayers: number; accent: string};
export type GuessingRiff = {version: 1; sourceRevision: string; settings: RiffSettings; files: Record<SourceFile, string>};

export function newGuessingRiff(): GuessingRiff {
  return {
    version: 1, sourceRevision: SOURCE_REVISION,
    settings: {title: 'My Daily Ritual', prompt: 'A secret number is brewing. What’s your guess?', prizeName: 'Guessing Game Prize', maxPlayers: 5, accent: '#d5ef4b'},
    files: Object.fromEntries(EDITABLE_FILES.map(path => [path, path === 'tari.config.toml'
      ? upstream.files[path].replace(/^template-address\s*=.*\n?/m, '')
      : upstream.files[path]])) as Record<SourceFile, string>,
  };
}

export function readGuessingRiff(value: unknown): GuessingRiff | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as GuessingRiff;
  const settings = draft.settings;
  if (draft.version !== 1 || draft.sourceRevision !== SOURCE_REVISION || !settings || !draft.files) return null;
  if (!['title', 'prompt', 'prizeName'].every(key => typeof settings[key as keyof RiffSettings] === 'string')) return null;
  if (!Number.isInteger(settings.maxPlayers) || settings.maxPlayers < 1 || settings.maxPlayers > 10) return null;
  if (!/^#[0-9a-f]{6}$/i.test(settings.accent)) return null;
  if (!EDITABLE_FILES.every(path => typeof draft.files[path] === 'string' && draft.files[path].length <= 100_000)) return null;
  return {...draft, files: Object.fromEntries(EDITABLE_FILES.map(path => [path, draft.files[path]])) as Record<SourceFile, string>};
}

function rustString(value: string) {
  return JSON.stringify(value).replace(/\\u([0-9a-f]{4})/gi, '\\u{$1}');
}

/** Keep visual controls tied to their exact Rust counterparts; preserve other source edits. */
export function configureRiff(draft: GuessingRiff, settings: RiffSettings): GuessingRiff {
  const source = draft.files['src/lib.rs'];
  const players = /const MAXIMUM_GUESSES_PER_ROUND: usize = \d+;/;
  const prize = /\.metadata\("name", "(?:[^"\\]|\\.)*"\)/;
  if ((settings.maxPlayers !== draft.settings.maxPlayers && !players.test(source)) ||
      (settings.prizeName !== draft.settings.prizeName && !prize.test(source))) {
    throw new Error('These rules were changed in the code editor. Edit them there, or restore the template before using these controls.');
  }
  let updated = source;
  if (settings.maxPlayers !== draft.settings.maxPlayers) updated = updated.replace(players, `const MAXIMUM_GUESSES_PER_ROUND: usize = ${settings.maxPlayers};`)
    .replace(/Contains up to \d+ guesses from different users/, `Contains up to ${settings.maxPlayers} guesses from different users`);
  if (settings.prizeName !== draft.settings.prizeName) updated = updated.replace(prize, () => `.metadata("name", ${rustString(settings.prizeName)})`);
  return {...draft, settings, files: {...draft.files, 'src/lib.rs': updated}};
}

export function sourceNotes(draft: GuessingRiff) {
  return `# ${draft.settings.title}\n\nBased on the official Tari Ootle guessing-game template.\nSource: ${SOURCE_URL}\nRevision: ${SOURCE_REVISION}\nGuide: ${GUESSING_GUIDE}\n\n## Files\n\n- index.html: standalone browser simulation generated from the visual settings. Open it in a browser to play. It does not execute the Rust source or connect a wallet.\n- src/lib.rs, Cargo.toml, build.rs, tests/test.rs: editable native Ootle template and its original engine tests.\n- riff.json: editor settings, source files and source revision.\n\n## Build the native template\n\nInstall the Rust toolchain and the wasm32-unknown-unknown target, then run:\n\n    cargo test\n    cargo build --target wasm32-unknown-unknown --release\n\nNative compilation and network deployment are not performed by this browser editor. Review and update tests after changing rules. The inherited deployed-template address was removed; publish your own template using the official guide. No trivia balances or reward-wheel state are copied into this Riff.\n\nUpstream Rust source: Copyright 2025–2026 The Tari Project, SPDX-License-Identifier: BSD-3-Clause.\n`;
}
