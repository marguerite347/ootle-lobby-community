import { useEffect, useState } from "react";
import { api, type ProjectState, type Version } from "../api";
import { compareProjectStates } from "../versionCompare";

export default function VersionCompare({
  projectId,
  current,
  versions,
}: {
  projectId: string;
  current: ProjectState | null;
  versions: Version[];
}) {
  const [revision, setRevision] = useState("");
  const [baseline, setBaseline] = useState<ProjectState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setBaseline(null);
    setError("");
    if (!revision) return;
    setLoading(true);
    api
      .projectState(projectId, revision)
      .then((state) => {
        if (active) setBaseline(state);
      })
      .catch(() => {
        if (active)
          setError(
            "That version could not load. Choose another version or retry.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, revision]);
  const diff =
    baseline && current ? compareProjectStates(baseline, current) : null;
  return (
    <section className="panel version-compare">
      <span className="release-label">YOUR BUILD, OVER TIME</span>
      <h3>Compare saved recipes</h3>
      <p className="muted mt8">
        Compare a historical snapshot with the latest saved state. Unsaved edits
        are not included.
      </p>
      <label className="lbl">
        Earlier version
        <select
          className="field"
          value={revision}
          onChange={(event) => setRevision(event.target.value)}
        >
          <option value="">Choose a version</option>
          {versions.map((version) => (
            <option key={version.hash} value={version.hash}>
              {version.shortHash} · {version.subject}
            </option>
          ))}
        </select>
      </label>
      {loading ? (
        <p role="status">Loading version…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        diff && (
          <div className="version-diff">
            {[
              ["Added", diff.added],
              ["Removed", diff.removed],
              ["Changed", diff.changed],
            ].map(([label, values]) => (
              <div key={label as string}>
                <h4>{label}</h4>
                <ul>
                  {(values as string[]).length ? (
                    (values as string[]).map((value) => (
                      <li key={value}>{value}</li>
                    ))
                  ) : (
                    <li className="muted">None</li>
                  )}
                </ul>
              </div>
            ))}
            <p>
              {diff.notesChanged ? "Notes changed." : "Notes unchanged."}{" "}
              {diff.recipeChanged
                ? "Recipe parameters or source pins changed."
                : "Recipe unchanged."}{" "}
              {diff.workflowChanged
                ? "Workflow connections changed."
                : "Workflow connections unchanged."}
            </p>
          </div>
        )
      )}
    </section>
  );
}
