import { useRef, useState } from 'react';

// Agents save small games in project state as { engine, entry, files: { path: source } }
// (see "Where your game goes" in AGENT_START.md). This plays the entry file in a
// sandbox with no same-origin access, so saved code can't touch the Lobby.
export type SavedGame = { engine?: string; entry?: string; status?: string; notes?: string; files: Record<string, string> };

export function savedGame(value: unknown): SavedGame | null {
  if (!value || typeof value !== 'object') return null;
  const files = (value as { files?: unknown }).files;
  if (!files || typeof files !== 'object') return null;
  const textFiles = Object.entries(files as Record<string, unknown>).filter(([, source]) => typeof source === 'string');
  if (!textFiles.length) return null;
  const game = value as SavedGame;
  const entry = game.entry || 'index.html';
  if (typeof (files as Record<string, unknown>)[entry] !== 'string') return null;
  return { ...game, entry, files: Object.fromEntries(textFiles) as Record<string, string> };
}

export default function ProjectGame({ game }: { game: SavedGame }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [run, setRun] = useState(0);
  const entry = game.entry || 'index.html';
  const otherFiles = Object.keys(game.files).filter(path => path !== entry);
  const focusGame = () => frame.current?.focus();
  const fullscreen = () => { void frame.current?.requestFullscreen?.().catch(() => undefined); };

  return <section className="panel project-game mt16" aria-labelledby="project-game-title">
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <span className="release-label">SAVED IN THIS PROJECT</span>
        <h2 id="project-game-title">Play</h2>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn" onClick={() => setRun(value => value + 1)}>Restart ↻</button>
        <button type="button" className="btn" onClick={fullscreen}>Fullscreen</button>
      </div>
    </div>
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 12, borderRadius: 16, overflow: 'hidden', background: '#000' }}>
      <iframe
        key={run}
        ref={frame}
        title={`Saved game: ${entry}`}
        srcDoc={game.files[entry]}
        sandbox="allow-scripts allow-pointer-lock"
        allow="fullscreen; gamepad"
        allowFullScreen
        onLoad={focusGame}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
    <p className="faint mt8" style={{ fontSize: 13 }}>
      Click the game to give it the keyboard. {game.engine ? `${game.engine} · ` : ''}{game.status ? `Status: ${game.status} · ` : ''}Saved versions aren't published to Lobby Games.
      {otherFiles.length ? ` Plays ${entry} only; ${otherFiles.length} other saved file${otherFiles.length === 1 ? '' : 's'} aren't loaded yet.` : ''}
    </p>
  </section>;
}
