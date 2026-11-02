import {LISTING_CONTESTS} from '../../shared/listingContests.mjs';

/** Organizer posts 520, 521 and 503, checked November 2, 2026. */
export type NovemberContest = {
  slug: string; category: string; title: string; accent: string; description: string;
  prize: string; prizeNote: string; deadline: string; closesAt: string | null;
  opensAt: string | null; threadUrl: string; action: string; steps: string[];
};
export const NOVEMBER_CONTESTS: NovemberContest[] = [
  {
    slug: 'november-mvp', category: 'Build contest', title: 'Build an', accent: 'MVP.',
    description: 'Make something people can use. Build on past contest projects and take the idea further.',
    prize: '1,750,000 XTM', prizeNote: '1st 1M · 2nd 500K · 3rd 250K XTM',
    deadline: 'Closes Dec 1 · 00:00 UTC', closesAt: '2026-12-01T00:00:00Z', opensAt: '2026-11-01T13:23:11Z',
    threadUrl: LISTING_CONTESTS['november-2026'].forumUrl, action: 'Enter your MVP',
    steps: [
      'Build a minimum viable product ready for real users. You may reuse previous contest code, including your own; make a meaningful improvement.',
      'Publish both the source code with an OSI-approved license and a working link to the MVP app.',
      'Announce your entry on Bluesky, Reddit, Medium or YouTube.',
      'Reply to the official thread with both links, a project description, your Tari payment address and the announcement link. Keep one post per entry and edit it for updates.',
    ],
  },
  {
    slug: 'first-to-launch', category: 'Mainnet bonus', title: 'First to', accent: 'launch.',
    description: 'Already entered a build contest? Be among the first 20 to bring your entry to mainnet.',
    prize: '100,000 XTM each', prizeNote: 'First 20 qualifying launches',
    // The source combines midnight, 11:11:11, November 21 and "one week".
    // No date is asserted until an organizer resolves that contradiction.
    deadline: 'Launch Nov 11 · Cutoff to be confirmed', closesAt: null, opensAt: null,
    threadUrl: 'https://community.tari.com/t/november-bonus-contest-first-to-launch/521', action: 'See launch requirements',
    steps: [
      'Have a contest entry already submitted. This is an additional reward for taking that entry live.',
      'Publish your contract on Ootle mainnet and provide proof of its publication time. The first 20 are ranked by the contract publish transaction date.',
      'If your entry includes an app, configure it for mainnet and have the complete submission ready for review.',
      'Reply to the bonus thread with your mainnet app or contract link and publication proof. Check the organizer’s cutoff before submitting.',
    ],
  },
  {
    slug: 'launch-creator', category: 'Launch creator contest', title: 'Make some', accent: 'noise.',
    description: 'Teach, film or tell a Tari story. Original articles, videos and short-form posts earn points.',
    prize: '1,000,000 XTM', prizeNote: '10 winners · 100,000 XTM each',
    deadline: 'Closes Nov 12 · 00:00 UTC', closesAt: '2026-11-12T00:00:00Z', opensAt: '2026-10-29T19:34:15Z',
    threadUrl: 'https://community.tari.com/t/ootle-launch-event-creator-contest/503', action: 'Enter the creator contest',
    steps: [
      'Create original Tari content and publish it on a qualifying platform. Research, education and tutorials are encouraged.',
      'Meet the platform requirements: join r/tari for Reddit; subscribe to @taricommunity for YouTube; follow everyone in the linked Bluesky starter pack for Bluesky.',
      'Reply to the official thread with evidence of your published work and your Tari payment address. Keep one post per person and update it as you add submissions.',
      'The top 10 by points win. Quality is judged by the Council; adapted cross-posts can count, copied posts and link-only shares do not. Winners are announced one week after the contest ends.',
    ],
  },
];

export function novemberContestPhase(contest: NovemberContest, now = new Date()) {
  if (contest.closesAt && now.getTime() >= Date.parse(contest.closesAt)) return 'closed';
  if (contest.opensAt && now.getTime() < Date.parse(contest.opensAt)) return 'upcoming';
  return contest.closesAt ? 'open' : 'unconfirmed';
}

export function novemberContestTiming(contest: NovemberContest, now = new Date()) {
  const phase = novemberContestPhase(contest, now);
  return phase === 'closed' ? 'Entries closed' : phase === 'upcoming' ? 'Coming soon' : contest.deadline;
}
