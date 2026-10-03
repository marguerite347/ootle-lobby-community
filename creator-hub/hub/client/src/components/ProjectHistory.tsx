import { useState } from "react";
import type { Version } from "../api";
export default function ProjectHistory({
  id,
  title,
  head,
  versions,
  onChanged,
  onDeleted,
}: {
  id: string;
  title: string;
  head: string | null;
  versions: Version[];
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [key, setKey] = useState(() => {
    try {
      return localStorage.getItem("project-management:" + id) || "";
    } catch {
      return "";
    }
  });
  const [action, setAction] = useState("clear-history"),
    [ref, setRef] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [reviewing, setReviewing] = useState(false);
  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(id)}/manage-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            action,
            ref,
            expectedHead: head,
            confirmation: id,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Unable to change history");
      setConfirmation("");
      setReviewing(false);
      setRef("");
      setMessage(
        action === "clear-history"
          ? "Older versions cleared. Your current game is ready to keep building."
          : "Saved version removed. Your current game is unchanged.",
      );
      if (result.deleted) {
        localStorage.removeItem("project-management:" + id);
        onDeleted();
      } else onChanged();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const olderVersions = versions.filter((version) => version.hash !== head);
  const selectedVersion = olderVersions.find((version) => version.hash === ref);
  const actionLabel =
    action === "clear-history"
      ? "Clear older versions"
      : action === "delete-version"
        ? "Delete selected version"
        : "Delete project";
  return (
    <details
      id="manage-project"
      className="panel mt24"
      open={window.location.hash === "#manage-project" ? true : undefined}
    >
      <summary>Manage project &amp; saved versions</summary>
      <p className="muted mt16">
        {versions.length} saved {versions.length === 1 ? "version" : "versions"}
        . Your latest saved game stays available when you clear older versions.
      </p>
      <label className="lbl">
        What would you like to manage?
        <select
          className="field"
          value={action}
          disabled={busy}
          onChange={(event) => {
            setAction(event.target.value);
            setReviewing(false);
            setConfirmation("");
          }}
        >
          <option value="clear-history">
            Clear older versions — keep current game
          </option>
          <option value="delete-version">Remove one older version</option>
          <option value="delete-project">Delete this project</option>
        </select>
      </label>
      {action === "delete-version" && (
        <label className="lbl">
          Choose a saved version
          <select
            className="field"
            value={ref}
            disabled={busy}
            onChange={(event) => {
              setRef(event.target.value);
              setReviewing(false);
              setConfirmation("");
            }}
          >
            <option value="">Choose an older version</option>
            {olderVersions.map((version) => (
              <option key={version.hash} value={version.hash}>
                {version.subject} · {version.shortHash}
              </option>
            ))}
          </select>
        </label>
      )}
      {action !== "delete-project" && !olderVersions.length && (
        <p>
          Only the current version remains. There is no older history to clear.
        </p>
      )}
      {action === "delete-project" && (
        <p>
          This removes the project and its saved versions from this Hub.
          Independently shared games, published builds and other creators’
          Riffs remain available.
        </p>
      )}
      {!key && (
        <p role="status">
          Open this project in the browser where you created it to manage it. If
          it was created before management access was added, ask your Hub
          administrator to restore access.
        </p>
      )}
      {!reviewing ? (
        <button
          className="btn mt16"
          disabled={
            !key ||
            busy ||
            (action !== "delete-project" && !olderVersions.length) ||
            (action === "delete-version" && !ref)
          }
          onClick={() => {
            setReviewing(true);
            setMessage("");
          }}
        >
          Review removal
        </button>
      ) : (
        <section className="panel mt16" aria-label="Confirm removal">
          <h3>{actionLabel}?</h3>
          <p>
            {action === "clear-history"
              ? `Remove ${olderVersions.length} older saved ${olderVersions.length === 1 ? "version" : "versions"} of “${title}”. Keep the latest saved game and continue saving new versions.`
              : action === "delete-version"
                ? `Remove “${selectedVersion?.subject}”. Keep the current game and all other saved versions.`
                : `Remove “${title}” and its ${versions.length} saved versions.`}
          </p>
          <p>
            Permanent removal cannot be undone here. Save any unfinished edits
            before continuing. Copies, Riffs, published builds and backups are
            unaffected.
          </p>
          <label className="lbl">
            Type the project title to confirm: {title}
            <input
              className="field"
              value={confirmation}
              disabled={busy}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
          <div className="row mt16">
            <button
              className="btn"
              disabled={busy}
              onClick={() => {
                setReviewing(false);
                setConfirmation("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn"
              disabled={busy || confirmation !== title}
              onClick={remove}
            >
              {busy ? "Updating…" : actionLabel}
            </button>
          </div>
        </section>
      )}
      {message && <p role="status">{message}</p>}
      <details className="mt16">
        <summary>Advanced: access &amp; storage details</summary>
        <p>
          Versions are stored on the Hub server. Removing history changes
          version links; files still used by retained versions remain. These
          controls do not erase all account data.
        </p>
        <p>
          New projects remember their management key in the creating browser.
          Existing projects can receive a key from the local storage
          administrator using the recovery script.
        </p>
        <label className="lbl">
          Management key
          <input
            className="field"
            type="password"
            autoComplete="off"
            value={key}
            disabled={busy}
            onChange={(event) => {
              setKey(event.target.value);
              setReviewing(false);
            }}
          />
        </label>
        <button
          className="btn"
          onClick={() => {
            try {
              localStorage.setItem("project-management:" + id, key);
              setMessage("Access remembered on this browser.");
            } catch {
              setMessage(
                "Browser storage unavailable; access lasts only for this visit.",
              );
            }
          }}
        >
          Remember access on this browser
        </button>
      </details>
    </details>
  );
}
