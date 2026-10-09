
// Agents save small games in project state as { engine, entry, files: { path: source } }
// Public Lobby policy requires local execution of arbitrary saved HTML games.
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
  const entry = game.entry || 'index.html';
  const otherFiles = Object.keys(game.files).filter(path => path !== entry);


  return <section className="panel project-game mt16" aria-labelledby="project-game-title">
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
      <div>
        <span className="release-label">SAVED IN THIS PROJECT</span>
        <h2 id="project-game-title">Play</h2>
      </div>
      <div className="row" style={{ gap: 8 }}>
        
        
      </div>
    </div>
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', marginTop: 12, borderRadius: 16, overflow: 'hidden', background: '#000' }}>
      <p className="faint" style={{padding:24}}>Saved HTML games cannot execute inside the public Lobby. Download the project and run it in your local development environment.</p>
    </div>
    <p className="faint mt8" style={{ fontSize: 13 }}>
      {game.engine ? `${game.engine} · ` : ''}{game.status ? `Status: ${game.status} · ` : ''}Saved versions aren't published to Lobby Games.
      {otherFiles.length ? ` The entry is ${entry}; ${otherFiles.length} other saved file${otherFiles.length === 1 ? '' : 's'} aren't loaded yet.` : ''}
    </p>
  </section>;
}
