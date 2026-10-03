import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export const EVENT_TYPES = [
  "tutorial_start",
  "tutorial_complete",
  "resource_open",
  "project_open",
];
const MAX_EVENTS = 10000;
function invalid(message) {
  return Object.assign(new Error(message), { status: 400 });
}
export function createCreatorAnalytics(root) {
  const file = path.join(root, "creator-analytics.json");
  function read() {
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
  }
  const clearedFile = path.join(root, "cleared-analytics-sessions.json");
  const cleared = () =>
    existsSync(clearedFile)
      ? JSON.parse(readFileSync(clearedFile, "utf8"))
      : [];
  function clearHistory(sessions) {
    if (
      !Array.isArray(sessions) ||
      sessions.length > 100 ||
      sessions.some(
        (value) =>
          typeof value !== "string" || !/^[a-z0-9-]{16,64}$/i.test(value),
      )
    )
      throw invalid("Provide at most 100 browser session identifiers");
    const before = read(),
      retained = before.filter((event) => !sessions.includes(event.session));
    mkdirSync(root, { recursive: true });
    // Remember cleared sessions so an in-flight event cannot recreate their history.
    writeFileSync(
      clearedFile,
      JSON.stringify([...new Set([...cleared(), ...sessions])]),
    );
    writeFileSync(file + ".tmp", JSON.stringify(retained));
    renameSync(file + ".tmp", file);
    return { removed: before.length - retained.length };
  }
  function record(input, now = new Date()) {
    if (!input || input.consent !== true)
      throw invalid("Explicit analytics consent is required");
    if (!EVENT_TYPES.includes(input.type)) throw invalid("Unknown event type");
    for (const key of ["id", "session"])
      if (
        typeof input[key] !== "string" ||
        !/^[a-z0-9-]{16,64}$/i.test(input[key])
      )
        throw invalid(`Invalid ${key}`);
    if (
      typeof input.subject !== "string" ||
      !/^[a-z0-9:_-]{1,160}$/i.test(input.subject)
    )
      throw invalid("Invalid resource or project identity");
    if (cleared().includes(input.session))
      return { accepted: false, cleared: true };
    const events = read();
    if (events.some((event) => event.id === input.id))
      return { accepted: true, duplicate: true };
    const recent = events.filter(
      (event) =>
        event.session === input.session && now - new Date(event.at) < 60000,
    );
    if (recent.length >= 30)
      throw Object.assign(new Error("Too many events; retry later"), {
        status: 429,
      });
    const event = {
      id: input.id,
      session: input.session,
      type: input.type,
      subject: input.subject,
      at: now.toISOString(),
    };
    events.push(event);
    mkdirSync(root, { recursive: true });
    writeFileSync(file + ".tmp", JSON.stringify(events.slice(-MAX_EVENTS)));
    renameSync(file + ".tmp", file);
    return { accepted: true, duplicate: false };
  }
  function summary(now = new Date()) {
    const events = read();
    const current = events.filter(
      (event) =>
        now - new Date(event.at) >= 0 &&
        now - new Date(event.at) < 7 * 86400000,
    );
    const previous = events.filter((event) => {
      const age = now - new Date(event.at);
      return age >= 7 * 86400000 && age < 14 * 86400000;
    });
    const count = (rows, type) =>
      rows.filter((row) => row.type === type).length;
    const starters = new Set(
      current
        .filter((event) => event.type === "tutorial_start")
        .map((event) => `${event.session}:${event.subject}`),
    );
    const completed = new Set(
      current
        .filter(
          (event) =>
            event.type === "tutorial_complete" &&
            current.some(
              (start) =>
                start.type === "tutorial_start" &&
                start.session === event.session &&
                start.subject === event.subject &&
                start.at <= event.at,
            ),
        )
        .map((event) => `${event.session}:${event.subject}`),
    );
    return {
      asOf: now.toISOString(),
      lastEventAt: events.at(-1)?.at || null,
      retentionLimit: MAX_EVENTS,
      totalRetained: events.length,
      metrics: EVENT_TYPES.map((type) => ({
        type,
        current: count(current, type),
        previous: count(previous, type),
        change: count(current, type) - count(previous, type),
      })),
      learning: {
        startedSessions: starters.size,
        completedSessions: completed.size,
        completionRate: starters.size ? completed.size / starters.size : null,
      },
      scope:
        "Opt-in local browser events; tutorial completion is self-reported, not a verified build or deployment.",
    };
  }
  return { record, summary, clearHistory };
}
