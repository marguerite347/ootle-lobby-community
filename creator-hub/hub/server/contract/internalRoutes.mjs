// Routes intentionally NOT in the public contract (openapi.mjs), each with a reason.
// The drift test fails if the app registers a route that is in neither list.
//
// `path` uses Express syntax as reported by routeInventory.mjs: `:param`, `*`,
// `regex:<source>`, and method `USE` for path-mounted middleware (static folders).
// Some entries are registered only in one mode (for example `GET /` exists only
// when the client has not been built), so an entry here may be absent at runtime.

export const INTERNAL_CATEGORIES = {
  'daily-spark': 'Daily Spark trivia: a human-only daily game with its own flow. Protected; not for agents.',
  marketing: 'Marketing calendar and growth reporting for the team.',
  analytics: 'Creator analytics events from the web client.',
  subscriptions: 'Email subscription sign-up for humans.',
  moderation: 'Community chat moderation; needs a moderator token.',
  journal: 'Journal and blog pages and feeds for humans and feed readers.',
  operations: 'Operational status for the team.',
  'web-client': 'Browser shell, redirects, static files and modules used by the web client.',
};

export const INTERNAL_ROUTES = [
  { method: 'GET', path: '/api/daily-trivia', category: 'daily-spark', reason: 'Daily Spark round state for the signed-in browser player.' },
  ...['start', 'answer', 'spin', 'super', 'decline', 'reset'].map((action) => ({ method: 'POST', path: `/api/daily-trivia/${action}`, category: 'daily-spark', reason: `Daily Spark ${action} step; human-only game flow.` })),

  { method: 'GET', path: '/api/marketing-calendar', category: 'marketing', reason: 'Team marketing calendar; local access only.' },
  { method: 'USE', path: '/calendar/draft', category: 'marketing', reason: 'Static marketing calendar draft; local access only.' },
  { method: 'GET', path: '/api/growth/summary', category: 'marketing', reason: 'Growth metrics summary for the team.' },
  { method: 'USE', path: '/growth-export', category: 'marketing', reason: 'Static growth metrics export folder.' },

  { method: 'GET', path: '/api/creator-analytics', category: 'analytics', reason: 'Aggregated creator analytics for the team.' },
  { method: 'POST', path: '/api/creator-analytics/events', category: 'analytics', reason: 'Web client analytics events.' },
  { method: 'POST', path: '/api/creator-analytics/clear', category: 'analytics', reason: 'Clears a browser session\'s analytics history.' },

  { method: 'GET', path: '/api/subscriptions/config', category: 'subscriptions', reason: 'Subscription form configuration for the web client.' },
  { method: 'POST', path: '/api/subscriptions', category: 'subscriptions', reason: 'Human email sign-up; agents must not subscribe people.' },

  { method: 'GET', path: '/api/community-chat/moderation', category: 'moderation', reason: 'Moderator queue; needs COMMUNITY_CHAT_MODERATOR_TOKEN.' },
  { method: 'POST', path: '/api/community-chat/messages/:messageId/moderate', category: 'moderation', reason: 'Hide, restore or delete a message; moderator token only.' },

  { method: 'GET', path: '/api/journal', category: 'journal', reason: 'Journal articles for the web client.' },
  { method: 'GET', path: '/api/launch', category: 'journal', reason: 'Launch announcement copy for the web client.' },
  { method: 'GET', path: '/blog', category: 'journal', reason: 'Journal index page (HTML).' },
  { method: 'GET', path: '/blog/:slug', category: 'journal', reason: 'Journal article page (HTML).' },
  { method: 'GET', path: '/blog/feed.xml', category: 'journal', reason: 'RSS feed for feed readers.' },
  { method: 'GET', path: '/blog/sitemap.xml', category: 'journal', reason: 'Sitemap for search engines.' },

  { method: 'GET', path: '/api/source-monitoring', category: 'operations', reason: 'Source monitor status; agents should read /api/sources instead.' },

  { method: 'GET', path: '/', category: 'web-client', reason: 'Fallback home page when the client is not built.' },
  { method: 'GET', path: 'regex:^(?!\\/(api|previews)).*', category: 'web-client', reason: 'SPA fallback: serves the web client for page routes.' },
  { method: 'GET', path: '/agent-start', category: 'web-client', reason: 'HTML rendering of /agent-start.md for people; agents read the Markdown.' },
  { method: 'GET', path: '/play', category: 'web-client', reason: 'Redirect to the /games page.' },
  { method: 'GET', path: '/game-shared/assetCommerce.mjs', category: 'web-client', reason: 'Browser module shared by the web client and game pages.' },
  { method: 'USE', path: '/previews', category: 'web-client', reason: 'Static preview images and clips referenced by resource `preview` fields.' },
];
