import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {ResourceCardMedia} from '../ui';
import ProjectCard from './ProjectCard';
import ContestProjectMetrics from './ContestProjectMetrics';
import {ContestGallery} from './ContestGallery';
describe('project navigation',()=>{
 it('renders contest sharing links before Details while retaining the original and independent controls',()=>{
  const original='https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396/7';
  const sharing='https://x.com/tari/status/2115066015264428033';
  const html=renderToStaticMarkup(<ContestGallery contest={{id:'october-2026',title:'October',threadUrl:original,checkedAt:'2026-11-02T00:00:00Z',observedSubmissionPosts:1,entries:[{slug:'crypt',title:'Crypt',summary:'Full source context.',cardSummary:'Explore escrow disputes.',creator:'Og.boy',sourceUrl:original,discussionLinks:[{url:sharing,platform:'X'}],repoUrl:'https://github.com/ogboy92ii/crypt',publishedAt:'2026-10-12T00:00:00Z',updatedAt:'2026-10-29T00:00:00Z',technologies:[]}]}}/>);
  const front=html.slice(0,html.indexOf('class="card-details project-card-details-content"'));
  expect(front).toContain(`href="${original}"`);expect(front).toContain('Original post');expect(front).toContain(`href="${sharing}"`);expect(front).toContain('Discussion · X');expect(front).toContain('aria-label="Explore project: Crypt"');
 });
 it('uses a native creator-post link alongside independent controls',()=>{
  const html=renderToStaticMarkup(<ProjectCard resource={{id:'example',title:'Example',ecosystem:'tari-ootle',native:true,preview:null}} sourceUrl="https://community.tari.com/t/example/396/5" creator="Creator" summary="Project" repoUrl="https://github.com/example/project" technologies={[]} actions={<a href="https://example.com/demo">Open project</a>}/>);
  expect(html).toContain('class="project-card-primary" href="https://community.tari.com/t/example/396/5"');expect(html).toContain('href="https://example.com/demo"');expect(html).toContain('href="https://github.com/example/project"');expect(html).not.toContain('Built with');
 });
 it('opens the repository root even for stale stargazers metrics or a template subdirectory',()=>{
  for(const repoUrl of ['https://github.com/okansaglam016161-pixel/caravel','https://github.com/example/project/tree/main/template']){
   const html=renderToStaticMarkup(<ContestProjectMetrics repoUrl={repoUrl}/>);
   expect(html).toContain(`href="${repoUrl.split('/').slice(0,5).join('/')}"`);expect(html).not.toContain('/stargazers');
  }
 });
});

it.each(['Source/docs walkthrough — application not demonstrated','Docs walkthrough — source, not executed application','App demo — public read-only interface','Public source walkthrough','Repository walkthrough · testnet interface screenshots','Official guide walkthrough · guessing-game example','Concept overview','Announcement walkthrough','Page walkthrough — public wallet entry; no trading'])('%s defers video and eager posters until the card approaches the viewport',(source)=>{
 const resource={id:'source',title:'Source',ecosystem:'tari',native:true,preview:{image:'/poster.jpg',video:'/source.mp4',source}};
 const html=renderToStaticMarkup(<ResourceCardMedia r={resource}/>);
 expect(html).not.toContain('<video');expect(html).toContain('loading="lazy"');expect(html).not.toContain('poster=');expect(html).not.toContain('src="/source.mp4"');expect(html).not.toContain('autoplay');expect(html).not.toContain('loop=""');
 // Cards nested in links show the poster; controls belong on the detail/standalone card.
 expect(renderToStaticMarkup(<ResourceCardMedia r={resource} interactive={false}/>)).not.toContain('<video');
});

it('separates authored purpose and visible status from complete disclosure without losing media or provenance',()=>{
 const html=renderToStaticMarkup(<ProjectCard resource={{id:'ghostkey',title:'GhostKey',ecosystem:'tari',native:true,preview:{image:'/poster.jpg',video:'/recording.mp4',source:'Source/docs walkthrough — application not demonstrated'}}} sourceUrl="https://community.tari.com/t/example/396/6" creator="Author" summary="Code not executed. Scalar math is not constant-time." cardSummary="Inspect Tari addresses offline." cardStatus="Source code" dates={<time>October 8</time>} caption={<span>Recorded October 10</span>} technologies={[]} />);
 expect(html).toContain('Inspect Tari addresses offline.');expect(html).toContain('Source code');expect(html).toContain('aria-label="Explore project: GhostKey"');
 const detailsStart=html.indexOf('class="card-details project-card-details-content"');
 const details=html.slice(detailsStart);
 expect(details).toContain('Scalar math is not constant-time.');expect(details).toContain('October 8');expect(details).toContain('Recorded October 10');
 expect(html.slice(0,detailsStart)).not.toContain('Scalar math');expect(html).toContain('loading="lazy"');expect(html).toContain('Creator’s post');
});
