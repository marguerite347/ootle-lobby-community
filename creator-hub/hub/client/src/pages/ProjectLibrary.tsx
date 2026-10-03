import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, type Project } from "../api";
import { ReleaseFeature, ProjectCollectionActions, ProjectCover } from "../ProjectShowcase";
import { publishedProjects } from "../projectDiscovery";
export default function ProjectLibrary() {
  const [items, setItems] = useState<Project[] | null>(null),
    [error, setError] = useState(""),
    [q, setQ] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestedView = params.get("view");
  const view = requestedView === "published" || requestedView === "all" ? requestedView : requestedView === "trending" ? "all" : "manage";
  const canManage = (id: string) => {
    try {
      return !!localStorage.getItem("project-management:" + id);
    } catch {
      return false;
    }
  };
  useEffect(() => {
    let active = true;
    api
      .projects()
      .then((d) => {
        if (active) setItems(d.projects);
      })
      .catch(() => {
        if (active) setError("Could not load projects. Refresh to retry.");
      });
    return () => {
      active = false;
    };
  }, []);
  const releases = publishedProjects(items || []);
  const shown = (
    view === "published"
        ? releases
        : view === "manage"
          ? (items || []).filter((p) => canManage(p.id))
          : items || []
  ).filter((p) =>
    `${p.title} ${p.description} ${p.author}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const featured =
    view === "manage"
      ? undefined
      : shown.find((p) => p.release && !p.forkedFrom);
  return (
    <section className="section projects-page" id="my-projects" aria-labelledby="my-projects-title">
      <header className="workspace-project-heading">
        <div><span className="season-eyebrow">FROM IDEA TO ENTRY</span><h2 id="my-projects-title">Your projects.</h2><p>Pick up where you left off, or start your next creation.</p></div>
        <Link className="season-button" to="/create">Start a build ↗</Link>
      </header>
      <div className="project-toolbar">
        <nav aria-label="Project filters">
          {[
            ["manage", "My projects"],
            ["all", "All projects"],
            ["published", "Published games & apps"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={view === id}
              className={view === id ? "selected" : ""}
              onClick={() => navigate({pathname: "/", search: `?view=${id}`, hash: "#my-projects"})}
            >
              {label}
            </button>
          ))}
        </nav>
        <input
          aria-label="Search projects"
          placeholder="Find a project or creator"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {error ? (
        <p role="alert">{error}</p>
      ) : !items ? (
        <div className="project-empty">Loading projects…</div>
      ) : (
        <>
          {view === "manage" && (
            <p className="sub">
              Projects you can manage from this browser.
            </p>
          )}
          {featured && <ReleaseFeature project={featured} />}
          <div className="project-list-heading">
            <h2>
              {view === "all"
                ? "In the lobby"
                : view === "manage"
                    ? "Your project library"
                    : "Published drops"}
            </h2>
            <span>
              {shown.length} {shown.length === 1 ? "project" : "projects"}
            </span>
          </div>
          {shown
            .filter((p) => p !== featured)
            .map((p) => (
              <article className="project-work-row project-work-card" key={p.id}>
                <div className="project-work-media"><ProjectCover project={p}/></div>
                <div>
                  <span className="release-label">
                    {p.forkedFrom
                      ? "Riff workspace"
                      : p.release
                        ? "Published creation"
                        : "Work in progress"}
                  </span>
                  <h3>
                    <Link to={`/project/${p.id}`}>{p.title}</Link>
                  </h3>
                  <p>{p.description}</p>
                  <small>By {p.author}</small>
                </div>
                <ProjectCollectionActions project={p} />
              </article>
            ))}
          {!shown.length && (
            <div className="project-empty">
              <h3>
                {view === "manage"
                    ? "No manageable projects found in this browser."
                    : "No projects match yet."}
              </h3>
              <p>
                {view === "manage"
                    ? "Your existing games are still in All projects. Open a project’s Manage controls to restore access."
                    : "Try another search or start something of your own."}
              </p>
              <Link
                to={
                  view === "manage" ? "/?view=all#my-projects" : "/?view=published#my-projects"
                }
              >
                {view === "manage"
                  ? "Show all projects →"
                  : "Browse published creations →"}
              </Link>
            </div>
          )}
          {shown.length === 1 && featured && (
            <p className="sub">
              Explore this release, or{" "}
              <Link to="/create">start the next one →</Link>
            </p>
          )}
        </>
      )}
    </section>
  );
}
