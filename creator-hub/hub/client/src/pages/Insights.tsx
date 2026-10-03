import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsEnabled, clearCreatorActivity } from "../creatorAnalytics";
type Summary = {
  asOf: string;
  lastEventAt: string | null;
  retentionLimit: number;
  totalRetained: number;
  metrics: {
    type: string;
    current: number;
    previous: number;
    change: number;
  }[];
  learning: {
    startedSessions: number;
    completedSessions: number;
    completionRate: number | null;
  };
  scope: string;
};
export default function Insights() {
  const [data, setData] = useState<Summary | null>(null),
    [error, setError] = useState(""),
    [enabled, setEnabled] = useState(analyticsEnabled),
    [retry, setRetry] = useState(0),
    [activityStatus, setActivityStatus] = useState(""),
    [clearing, setClearing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/creator-analytics", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw Error("Analytics unavailable.");
        setData(await response.json());
        setError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [retry]);
  function changeConsent(value: boolean) {
    try {
      localStorage.setItem("creator-analytics-consent", value ? "yes" : "no");
      setEnabled(value);
    } catch {
      setError(
        "This browser cannot save your preference. Tracking remains off.",
      );
    }
  }
  return (
    <section className="section">
      <header className="hero">
        <span className="release-label">CREATOR INSIGHTS / LOCAL PILOT</span>
        <h1>
          Learn what leads
          <br />
          to the next step.
        </h1>
        <p className="lede">
          See weekly learning activity. Clicks and self-reported progress are
          separate from working builds, retained players and revenue.
        </p>
      </header>
      <div className="panel">
        <label className="row">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => changeConsent(event.target.checked)}
          />{" "}
          Share anonymous learning activity from this browser
        </label>
        <p className="muted mt16">
          Off by default. No wallet address, email, query text or browsing
          history is collected. Events use a random browser-session ID. Turning
          this off stops future collection.
        </p>
      </div>
      <details className="panel mt16">
        <summary>Clear my recorded activity</summary>
        <p>
          Erase events for session identifiers retained by this browser and turn
          reporting off. Games and project versions are unchanged. Older
          sessions whose identifiers are already lost, other browsers, comments,
          profile records and private lessons are not included.
        </p>
        <button
          className="btn"
          disabled={clearing}
          onClick={async () => {
            setClearing(true);
            try {
              const result = await clearCreatorActivity();
              setEnabled(false);
              setActivityStatus(`Cleared ${result.removed} recorded events.`);
              setRetry((value) => value + 1);
            } catch (error) {
              setEnabled(false);
              setActivityStatus((error as Error).message);
            } finally {
              setClearing(false);
            }
          }}
        >
          Clear this browser’s activity and stop reporting
        </button>
        {activityStatus && <p role="status">{activityStatus}</p>}
      </details>
      <button
        className="btn mt16"
        onClick={() => setRetry((value) => value + 1)}
      >
        Refresh insights
      </button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <div className="insight-grid">
            {data.metrics.map((metric) => (
              <article className="panel" key={metric.type}>
                <span className="release-label">
                  {metric.type.replaceAll("_", " ")}
                </span>
                <strong className="insight-value">{metric.current}</strong>
                <p className="muted">
                  Last 7 days · {metric.change >= 0 ? "+" : ""}
                  {metric.change} vs previous 7 days
                </p>
              </article>
            ))}
          </div>
          <section className="panel">
            <h2>Learning completion</h2>
            <p className="insight-value">
              {data.learning.completionRate === null
                ? "No baseline yet"
                : `${Math.round(data.learning.completionRate * 100)}%`}
            </p>
            <p>
              {data.learning.completedSessions} completed of{" "}
              {data.learning.startedSessions} started session–guide pairs this
              week.
            </p>
            <p className="muted mt16">{data.scope}</p>
            <p className="faint mt16">
              Last event:{" "}
              {data.lastEventAt
                ? new Date(data.lastEventAt).toLocaleString()
                : "No consented events yet"}
              . Report refreshed {new Date(data.asOf).toLocaleString()}. Retains
              the latest {data.retentionLimit.toLocaleString()} events; this is
              not a production warehouse.
            </p>
          </section>
        </>
      )}
      <p className="muted mt24">
        Per-release gameplay retention, revenue and production exports remain
        separate integrations.{" "}
        <Link to="/skills/native">Open the skills library →</Link>
      </p>
    </section>
  );
}
