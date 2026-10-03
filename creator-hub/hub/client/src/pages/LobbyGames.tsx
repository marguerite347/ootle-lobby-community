import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Project } from "../api";
import { ProjectCover } from "../ProjectCover";
import { lobbyGameSections, playableRelease, playUrlWithProject } from "../projectDiscovery";
import LobbyTrail from "../components/LobbyTrail";

/** Every playable game in the lobby: originals first, then community remixes. */
export default function LobbyGames() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .projects()
      .then((data) => {
        if (active) setItems(data.projects);
      })
      .catch(() => {
        if (active) setError("Could not load games. Refresh to retry.");
      });
    return () => {
      active = false;
    };
  }, []);

  const { originals, remixes } = lobbyGameSections(items || []);
  return (
    <section className="section projects-page">
      <LobbyTrail section="Lobby Games" />
      <header className="projects-intro lobby-games-intro">
        <div>
          <span className="release-label">PLAY IN THE LOBBY</span>
          <h1>
            Lobby Games.
            <br />
            <span>Press start.</span>
          </h1>
          <p>
            Every published game runs right here in the browser. Play a round,
            then make it your own Riff.
          </p>
        </div>
        <Link className="btn" to="/create">
          Start a build.
        </Link>
      </header>
      {error ? (
        <p role="alert">{error}</p>
      ) : !items ? (
        <div className="project-empty">Loading games…</div>
      ) : (
        <>
          <GameSection title="Lobby originals" games={originals} />
          <GameSection title="Community Riffs" games={remixes} />
          {!originals.length && !remixes.length && (
            <div className="project-empty">
              <h3>New games are on the way.</h3>
              <p>The lobby is getting a fresh start. Published games will show up here.</p>
              <Link to="/create">Start a build →</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function GameSection({ title, games }: { title: string; games: Project[] }) {
  if (!games.length) return null;
  return (
    <>
      <div className="project-list-heading">
        <h2>{title}</h2>
        <span>
          {games.length} {games.length === 1 ? "game" : "games"}
        </span>
      </div>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </>
  );
}

function GameCard({ game }: { game: Project }) {
  const release = playableRelease(game);
  return (
    <article className="project-work-row project-work-card">
      <div className="project-work-media">
        <ProjectCover project={game} />
      </div>
      <div>
        <h3>
          <Link to={`/project/${game.id}`}>{game.title}</Link>
        </h3>
        <p>{game.description}</p>
        <small>By {game.author}</small>
      </div>
      <div className="release-actions">
        {release && (
          <a className="btn primary" href={playUrlWithProject(release.playUrl, game.id)}>
            Play ↗
          </a>
        )}
        <Link className="more" to={`/project/${game.id}`}>
          Explore & Riff →
        </Link>
      </div>
    </article>
  );
}
