import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {describe, it, expect} from 'vitest';
import {NOVEMBER_CONTESTS, novemberContestPhase, novemberContestTiming} from './novemberContests';
import {NovemberContestCards, NovemberContestDetail} from './components/NovemberContests';

describe('November contest routes and closing boundaries', () => {
  it('closes each dated contest at its own UTC cutoff, without inventing a bonus cutoff', () => {
    const [mvp, bonus, creator] = NOVEMBER_CONTESTS;
    expect(novemberContestPhase(mvp, new Date('2026-11-01T12:00:00Z'))).toBe('upcoming');
    expect(novemberContestPhase(mvp, new Date('2026-11-30T23:59:59Z'))).toBe('open');
    expect(novemberContestPhase(mvp, new Date('2026-12-01T00:00:00Z'))).toBe('closed');
    expect(novemberContestPhase(creator, new Date('2026-11-11T23:59:59Z'))).toBe('open');
    expect(novemberContestTiming(creator, new Date('2026-11-12T00:00:00Z'))).toBe('Entries closed');
    expect(bonus.closesAt).toBeNull();
    expect(novemberContestPhase(bonus, new Date('2026-11-21T12:00:00Z'))).toBe('unconfirmed');
  });
  it('gives all three cards distinct briefs with the correct official entry path', () => {
    const cards = renderToStaticMarkup(<MemoryRouter><NovemberContestCards/></MemoryRouter>);
    for (const contest of NOVEMBER_CONTESTS) {
      expect(cards).toContain(`href="/challenges/${contest.slug}"`);
      const detail = renderToStaticMarkup(<MemoryRouter><NovemberContestDetail contest={contest}/></MemoryRouter>);
      expect(detail).toContain(`href="${contest.threadUrl}"`);
      expect(detail).toContain('href="https://community.tari.com/signup"');
      expect(detail.includes('/submit?contest=november')).toBe(contest.slug === 'november-mvp');
      expect(detail).not.toContain('<form');
    }
  });
});
