import {readSnapshot} from './trelloSnapshot.mjs';
const BOARD_ID = 'LrJpBwNN';
const BOARD_URL = `https://trello.com/b/${BOARD_ID}/tari-l2-launch-marketing-calendar`;
const REFRESH_MS = 60_000;
const MAX_RESPONSE_BYTES = 2_000_000;

function trelloLink(value) {
  try {
    const url = new URL(value);
    return url.origin === 'https://trello.com' && /^\/c\/[a-zA-Z0-9]+(?:\/|$)/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}

function dateValue(value) {
  if (value == null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error('Invalid card date');
  }
  return new Date(value).toISOString();
}

export function calendarItems(cards, lists) {
  if (!Array.isArray(cards) || !Array.isArray(lists)) throw new Error('Invalid board response');
  const listNames = new Map(lists.map(list => [list.id, list.name]));
  return cards.filter(card => !card.closed).map(card => {
    const url = trelloLink(card.url);
    if (typeof card.id !== 'string' || typeof card.name !== 'string' || !url) throw new Error('Invalid card');
    return {
      id: card.id, title: card.name, url,
      due: dateValue(card.due), start: dateValue(card.start), complete: card.dueComplete === true,
      list: String(listNames.get(card.idList) || 'Unlisted'),
      labels: (Array.isArray(card.labels) ? card.labels : []).map(label => String(label.name || '')).filter(Boolean),
    };
  }).sort((left, right) => (left.due || left.start || '9999').localeCompare(right.due || right.start || '9999') || left.title.localeCompare(right.title));
}

async function readJson(response) {
  if (!response.ok) throw new Error(`Trello returned ${response.status}`);
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) throw new Error('Board response too large');
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { await reader.cancel(); }
}

export function createMarketingCalendar({env = process.env, fetchImpl = fetch, now = Date.now, snapshotReader = readSnapshot} = {}) {
  let items = [], lastSyncedAt = null, lastAttempt = null, failure = null, pending = null;
  const configured = Boolean(env.TRELLO_API_KEY && env.TRELLO_API_TOKEN);
  async function request(resource, fields) {
    const url = new URL(`https://api.trello.com/1/boards/${BOARD_ID}/${resource}`);
    url.search = new URLSearchParams({fields, key: env.TRELLO_API_KEY, token: env.TRELLO_API_TOKEN}).toString();
    return readJson(await fetchImpl(url, {signal: AbortSignal.timeout(10_000), redirect: 'error', headers: {Accept: 'application/json'}}));
  }
  async function refresh() {
    lastAttempt = now();
    try {
      const [cards, lists] = await Promise.all([
        request('cards/open', 'name,due,start,dueComplete,closed,url,idList,labels'),
        request('lists/open', 'name'),
      ]);
      items = calendarItems(cards, lists);
      lastSyncedAt = new Date(now()).toISOString();
      failure = null;
    } catch {
      // Never return upstream bodies, request URLs or credential-bearing errors.
      failure = 'Could not refresh Trello. Check the server connection and board access.';
    }
  }
  return async function getCalendar() {
    if (!configured) {
      try {
        const snapshot = snapshotReader();
        if(snapshot) {
          const age = now() - Date.parse(snapshot.syncedAt);
          const stale = age > 15 * 60_000 || age < -60_000;
          const cards = snapshot.lists.flatMap(list => list.cards.map(card => ({...card,idList:list.id})));
          return {boardUrl:BOARD_URL,timeZone:'America/New_York',refreshSeconds:60,
            status:stale?'stale':'connected',source:'trello-connector',
            message:stale?'Trello sync is overdue. Showing the last successful snapshot.':'Synced through the Trello connector. Scheduled refresh every 5 minutes while Mac and Codex are running.',
            lastSyncedAt:snapshot.syncedAt,items:calendarItems(cards,snapshot.lists)};
        }
      } catch {
        return {boardUrl:BOARD_URL,status:'error',message:'The Trello snapshot could not be read. Waiting for the next successful sync.',lastSyncedAt:null,items:[]};
      }
    }
    if (configured && (lastAttempt === null || now() - lastAttempt >= REFRESH_MS)) {
      if (!pending) pending = refresh().finally(() => {pending = null;});
    }
    if (pending) await pending;
    return {boardUrl: BOARD_URL, timeZone: 'America/New_York', refreshSeconds: REFRESH_MS / 1000,
      status: !configured ? 'not-connected' : failure ? (lastSyncedAt ? 'stale' : 'error') : 'connected',
      message: !configured ? 'Trello connection needed. The server needs read access to this board.' : failure,
      lastSyncedAt, items};
  };
}

// The current app has no team authentication. Keep private board data loopback-only.
export function localCalendarRequest(request) {
  const address = request.socket.remoteAddress;
  const host = request.headers.host || '';
  return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) &&
    /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host);
}
