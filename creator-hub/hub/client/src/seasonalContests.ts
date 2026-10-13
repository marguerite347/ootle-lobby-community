/** Council sources checked 2026-10-13. Prize settlement stays with the Council. */
export const OCTOBER_CONTESTS = {
  opensAt: '2026-10-01T00:00:00Z',
  closesAt: '2026-11-01T00:00:00Z',
  checkedAt: '2026-10-13',
  buildThread: 'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396',
  buildRules: 'https://community.tari.com/t/ootle-launch-date-and-launch-contest-rules/323/1',
  securityThread: 'https://community.tari.com/t/extra-contest-ootle-security-bug-hunt/397',
  privateReporting: 'https://github.com/tari-project/tari-ootle/security',
  securityBranch: 'development',
};

export function octoberContestStatus(now = new Date()) {
  if (now.getTime() < Date.parse(OCTOBER_CONTESTS.opensAt)) return 'Opens October 1';
  return now.getTime() < Date.parse(OCTOBER_CONTESTS.closesAt) ? 'Entries open' : 'Entries closed';
}

export const BUILD_CHECKLIST = [
  'Build new code for the Spooky Secrets theme and demonstrate Tari privacy.',
  'Publish your code or app with an OSI-approved open-source license.',
  'Announce your October entry publicly on Bluesky or Reddit, as required this month.',
  'Prepare your project description, public links and Tari payment address.',
  'Post one entry in the official thread. Update that post as your project evolves.',
];

export const SECURITY_CHECKLIST = [
  'Check the latest development branch, contest scope, existing pull requests and security advisories.',
  'Reproduce the finding on infrastructure you own.',
  'Document one root cause, attacker position and reproducible proof of concept.',
  'Include the affected code, claimed severity, CVSS v4 vector and payout address.',
  'Submit privately with a [Bug Hunt] title before the deadline.',
];
