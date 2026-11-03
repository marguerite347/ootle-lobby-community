import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {expect, test} from 'vitest';
import CreatorSubmissions from './CreatorSubmissions';
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
