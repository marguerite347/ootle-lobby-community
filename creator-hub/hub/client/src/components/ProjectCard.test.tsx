import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {ResourceCardMedia} from '../ui';
import ProjectCard from './ProjectCard';
import ContestProjectMetrics from './ContestProjectMetrics';
describe('project navigation',()=>{
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

it('source walkthroughs expose native playback controls and do not autoplay or loop',()=>{
 const resource={id:'source',title:'Source',ecosystem:'tari',native:true,preview:{image:'/poster.jpg',video:'/source.mp4',source:'Source/docs walkthrough — application not demonstrated'}};
 const html=renderToStaticMarkup(<ResourceCardMedia r={resource}/>);
 expect(html).toContain('controls=""');expect(html).toContain('poster="/poster.jpg"');expect(html).toContain('preload="none"');expect(html).not.toContain('autoplay');expect(html).not.toContain('loop=""');
 // Cards nested in links show the poster; controls belong on the detail/standalone card.
 expect(renderToStaticMarkup(<ResourceCardMedia r={resource} interactive={false}/>)).not.toContain('<video');
});
