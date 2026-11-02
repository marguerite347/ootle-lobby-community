/** Official entry topics. Lobby intake requests a listing, not contest registration. */
export const LISTING_CONTESTS = {
  'october-2026': {
    label: 'October · Spooky Secrets', topicId: '396',
    forumUrl: 'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396',
    requirements: 'your project description, public app or code link, Tari payment address, and Bluesky or Reddit announcement',
  },
  'november-2026': {
    label: 'November · MVP', topicId: '520',
    forumUrl: 'https://community.tari.com/t/november-build-contest-thread-mvp/520',
    requirements: 'your public source code, working MVP app, project description, Tari payment address, and announcement on Bluesky, Reddit, Medium or YouTube',
  },
};
export function listingContest(destination) {
  return Object.hasOwn(LISTING_CONTESTS, destination) ? LISTING_CONTESTS[destination] : undefined;
}
