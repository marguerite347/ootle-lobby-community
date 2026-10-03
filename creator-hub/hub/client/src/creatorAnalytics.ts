export function analyticsEnabled() {
  try {
    return localStorage.getItem("creator-analytics-consent") === "yes";
  } catch {
    return false;
  }
}
export async function recordCreatorEvent(type: string, subject: string) {
  if (!analyticsEnabled()) return;
  try {
    let session = sessionStorage.getItem("creator-analytics-session");
    if (!session) {
      session = crypto.randomUUID();
      sessionStorage.setItem("creator-analytics-session", session);
    }
    const known = JSON.parse(
      localStorage.getItem("creator-analytics-sessions") || "[]",
    );
    if (!known.includes(session))
      localStorage.setItem(
        "creator-analytics-sessions",
        JSON.stringify([...known, session].slice(-100)),
      );
    await fetch("/api/creator-analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        session,
        type,
        subject,
        consent: true,
      }),
    });
  } catch {
    /* Analytics must never prevent a creator from using the hub. */
  }
}

export async function clearCreatorActivity() {
  localStorage.setItem("creator-analytics-consent", "no");
  const current = sessionStorage.getItem("creator-analytics-session");
  const sessions = [
    ...new Set([
      ...JSON.parse(localStorage.getItem("creator-analytics-sessions") || "[]"),
      ...(current ? [current] : []),
    ]),
  ];
  const response = await fetch("/api/creator-analytics/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessions }),
  });
  if (!response.ok)
    throw Error(
      "Could not clear recorded activity. Reporting is off; retry clearing.",
    );
  const result = await response.json();
  localStorage.removeItem("creator-analytics-sessions");
  sessionStorage.removeItem("creator-analytics-session");
  return result;
}
