/** Council sources checked 2026-10-03. Prize settlement stays with the Council. */
export const OCTOBER_CONTESTS = {
  opensAt: '2026-10-01T00:00:00Z',
  closesAt: '2026-11-01T00:00:00Z',
  checkedAt: '2026-10-03',
  buildThread: 'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396',
  buildRules: 'https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1',
  securityThread: 'https://community.tari.com/t/extra-contest-ootle-security-bug-hunt/397',
  privateReporting: 'https://github.com/tari-project/tari-ootle/security',
  securityCommit: '392d805579db35fcc8e8bc1aba84adc1fffe0c22',
};

export function octoberContestStatus(now = new Date()) {
  if (now.getTime() < Date.parse(OCTOBER_CONTESTS.opensAt)) return 'Opens October 1';
  return now.getTime() < Date.parse(OCTOBER_CONTESTS.closesAt) ? 'Entries open' : 'Entries closed';
}

export const BUILD_CHECKLIST = [
  'Build new code for the Spooky Secrets theme and demonstrate Tari privacy.',
  'Publish your code or app with an OSI-approved open-source license.',
  'Announce your entry publicly on X, Bluesky, Reddit or another social platform.',
  'Prepare your project description, public links and Tari payment address.',
  'Post one entry in the official thread. Update that post as your project evolves.',
];

export const SECURITY_CHECKLIST = [
  'Check the scope, trust model and known issues at the pinned commit.',
  'Reproduce the finding on infrastructure you own.',
  'Document one root cause, attacker position and reproducible proof of concept.',
  'Include the affected code, claimed severity, CVSS v4 vector and payout address.',
  'Submit privately with a [Bug Hunt] title before the deadline.',
];
