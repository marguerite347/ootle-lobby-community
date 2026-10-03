import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {OctoberGallery,type OctoberContest} from './OctoberSubmissions';
const contest:OctoberContest={id:'october-2026',title:'October',threadUrl:'https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396',checkedAt:'2026-10-03T12:00:00Z',observedSubmissionPosts:0,entries:[]};
describe('October shared gallery',()=>{
 it('shows a dated empty state without fictional entries',()=>{
  const html=renderToStaticMarkup(<OctoberGallery contest={contest}/>);
  expect(html).toContain('No October projects are listed yet');expect(html).toContain('12:00 UTC');expect(html).not.toContain('<article');
 });
 it('renders a new community entry, recording credit and source evidence',()=>{
  const html=renderToStaticMarkup(<OctoberGallery contest={{...contest,observedSubmissionPosts:1,entries:[{slug:'test-game',title:'Test game',summary:'A confidential puzzle.',creator:'Creator',sourceUrl:`${contest.threadUrl}/5`,repoUrl:'https://github.com/example/game',publishedAt:contest.checkedAt,updatedAt:contest.checkedAt,technologies:[{label:'Puzzle template',sourceUrl:'https://github.com/example/game/blob/main/template.rs'}],recording:{url:'https://example.com/demo.mp4',capturedAt:contest.checkedAt,sourceRevision:'abc123',kind:'walkthrough',credit:'Contributor'}}]}}/>);
  expect(html).toContain('Test game');expect(html).toContain('Contributor');expect(html).toContain('controls=""');expect(html).toContain('template.rs');expect(html).toContain('/test-game.json');expect(html).not.toContain('autoplay');
 });
});
