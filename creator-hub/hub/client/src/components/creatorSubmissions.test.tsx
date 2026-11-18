import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {expect, test, vi} from 'vitest';
import CreatorSubmissions from './CreatorSubmissions';
// Keep this media regression focused on its recorded entry as newer creators arrive.
vi.mock('../../../../../content/creator-submissions/launch-2026.json', async importOriginal => {
 const actual = await importOriginal<{default: typeof import('../../../../../content/creator-submissions/launch-2026.json')}>();
 return {default:{...actual.default,entries:actual.default.entries.filter(entry => entry.resourceIds.some(id => id === 'tari-ootle:learn:habib-four-lanes'))}};
});
test('new creator articles expose their reviewed poster, summary, details and original discussion', () => {
 const html=renderToStaticMarkup(<MemoryRouter><CreatorSubmissions/></MemoryRouter>);
 for (const key of ['habib-four-lanes']) {
  expect(html).toContain(`resource-${key}-20261102`);
  expect(html).toContain(`/resource/tari-ootle%3Alearn%3A${key}`);
 }
 expect(html).toContain('Original post');
 expect(html).toContain('Docs walkthrough');
 expect(html).toContain('protocol instead targets a share of blocks');
});

import dnodeSubmissions from '../../../../../content/creator-submissions/dnode-memes-2026.json';
test('DNode source posts keep a separate heading, original links and organizer attribution', () => {
 const html=renderToStaticMarkup(<MemoryRouter><CreatorSubmissions feed={dnodeSubmissions} id="dnode-creator-submissions" title="DNode meme contest" description="Read creator entries at the source." judging="Selection stays with the contest organizers."/></MemoryRouter>);
 expect(html).toContain('DNode meme contest');
 for (const n of [14,15,16]) expect(html).toContain(`/531/${n}`);
 expect(html).toContain('Original post');
 expect(html).not.toContain('Judging stays with the Council.');
 expect(html).not.toContain('<video');
 expect(html).not.toContain('drive.google.com');
});
