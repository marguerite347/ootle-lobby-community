import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,expect,it,vi} from 'vitest';
import {ResourceCardMedia} from './ui';
import ProjectCard from './components/ProjectCard';

// Model a card whose IntersectionObserver has made the media ready. This checks
// the actual video attributes after lazy loading, not only the initial poster.
vi.mock('react',async()=>{
  const actual=await vi.importActual<typeof import('react')>('react');
  return {...actual,useState:()=>[true,()=>{}]};
});

describe('loaded recording controls',()=>{
  it.each([
    'Source walkthrough — game design and privacy model; no gameplay or transaction performed.',
    'Source walkthrough — node map, deployment guide and privacy notes',
    'Source/docs walkthrough — README; app not run',
    'Docs walkthrough',
    'Announcement',
    'Concept overview',
    'App demo',
  ])('keeps independent playback controls for %s',(source)=>{
    const r={id:'recording',title:'Recording',ecosystem:'tari',native:true,preview:{image:null,video:'/recording.mp4',source}};
    const html=renderToStaticMarkup(<ResourceCardMedia r={r}/>);
    expect(html).toContain('<video');
    expect(html).toContain('controls=""');
    expect(html).not.toContain('loop=""');
    expect(html).not.toContain('autoPlay');
    expect(renderToStaticMarkup(<ResourceCardMedia r={r} interactive={false}/>)).not.toContain('<video');
  });
  it('retains looping preview behavior for a general promotional clip',()=>{
    const html=renderToStaticMarkup(<ResourceCardMedia r={{id:'preview',title:'Preview',ecosystem:'tari',native:true,preview:{image:null,video:'/preview.mp4',source:'Creator preview'}}}/>);
    expect(html).toContain('loop=""');
    expect(html).not.toContain('controls=""');
  });
});

it.each(['Captured public page', 'Creator preview', undefined])('project recordings retain manual controls for legacy caption %s', source => {
  const resource={id:'legacy',title:'Legacy recording',ecosystem:'tari',native:true,preview:{image:null,video:'/recording.mp4',source}};
  const html=renderToStaticMarkup(<ProjectCard resource={resource} sourceUrl="https://community.tari.com/t/example/1" creator="Creator" summary="Source walkthrough" technologies={[]}/>);
  expect(html).toContain('controls=""');
  expect(html).not.toContain('loop=""');
});
