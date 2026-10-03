import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {ProjectCollectionActions} from './ProjectShowcase';
import {lobbyGameSections,playableRelease,publishedProjects,trendingProjects} from './projectDiscovery';
import type {Project} from './api';
const rows=[{id:'draft',createdAt:'2026-09-22',recentActivity:9},{id:'old',createdAt:'2026-09-01',publishedAt:'2026-09-20',release:{},recentActivity:3},{id:'new',createdAt:'2026-09-21',release:{},recentActivity:0},{id:'fork',createdAt:'2026-09-22',release:{},forkedFrom:'old',recentActivity:5}] as Project[];
describe('published discovery',()=>{
 it('shows reviewed releases newest first without republishing workspace forks',()=>expect(publishedProjects(rows).map(p=>p.id)).toEqual(['new','old']));
 it('requires recent community activity, not creation or saved-state popularity',()=>expect(trendingProjects(rows).map(p=>p.id)).toEqual(['old']));
});
it('includes published fork artifacts owned by that project',()=>{
 const own={id:'remix',createdAt:'2026-09-23',forkedFrom:'old',release:{projectId:'remix'}} as Project;
 expect(publishedProjects([...rows,own]).map(p=>p.id)).toEqual(['remix','new','old']);
});
it('lists only playable originals and owned playable Riffs, newest first',()=>{
 const original={id:'original',createdAt:'2026-09-21',release:{playUrl:'/games/original/'}} as Project;
 const newer={...original,id:'newer',createdAt:'2026-09-24'};
 const own={id:'remix',createdAt:'2026-09-23',forkedFrom:'original',release:{projectId:'remix',playUrl:'/games/remix/'}} as Project;
 const unbuilt={...own,id:'unbuilt',release:{projectId:'unbuilt'}} as Project;
 const inherited={...own,id:'inherited',release:original.release} as Project;
 const {originals,remixes}=lobbyGameSections([...rows,own,unbuilt,inherited,original,newer]);
 expect(originals.map(p=>p.id)).toEqual(['newer','original']);
 expect(remixes.map(p=>p.id)).toEqual(['remix']);
});

function card(project: Project) {
  return renderToStaticMarkup(<MemoryRouter><ProjectCollectionActions project={project}/></MemoryRouter>);
}

describe('collection play actions', () => {
  const released = {id:'example-game', title:'Example Game', release:{playUrl:'/games/example-game/', title:'Example Game'}} as Project;
  const draft = {id:'draft-workshop', title:'Draft workshop'} as Project;
  const workspaceFork = {id:'example-fork', forkedFrom:'example-game', release:{playUrl:'/games/example-game/', title:'Example Game'}} as Project;
  const publishedRemix = {id:'example-remix', forkedFrom:'example-game', release:{playUrl:'/games/example-game/?remix=1', projectId:'example-remix', title:'Example Riff'}} as Project;

  it('offers Play only when this project has its own playable release', () => {
    expect(playableRelease(released)?.playUrl).toBe('/games/example-game/');
    expect(playableRelease(draft)).toBeNull();
    expect(playableRelease(workspaceFork)).toBeNull();
    expect(playableRelease(publishedRemix)?.playUrl).toContain('remix=1');
  });

  it('shows Play and Open project on a released card', () => {
    const html = card(released);
    expect(html).toContain('Play / open');
    expect(html).toContain('project='); // playUrlWithProject appends project id
    expect(html).toMatch(/href=\"\/games\/example-game\/\?project=/);
    expect(html).toContain('Open project');
    expect(html).toContain('href="/project/example-game"');
  });

  it('keeps Open project on drafts and parent-build forks without a Play link', () => {
    for (const project of [draft, workspaceFork]) {
      const html = card(project);
      expect(html).toContain('Open project');
      expect(html).toContain('Manage');
      expect(html).not.toContain('Play / open');
    }
  });

  it('keeps Open project beside Play on a published Riff', () => {
    const html = card(publishedRemix);
    expect(html).toContain('Play / open');
    expect(html).toContain('href="/games/example-game/?remix=1&amp;project=example-remix"');
    expect(html).toContain('Open project');
    expect(html).toContain('href="/project/example-remix"');
  });
});

import {playUrlWithProject, isLocalPlayUrl, validatedProjectQueryId} from './projectDiscovery';

describe('playUrlWithProject origin preserve', () => {
  it('appends project on local /games paths', () => {
    expect(playUrlWithProject('/games/sample-game/', 'sample-game-73da8d'))
      .toBe('/games/sample-game/?project=sample-game-73da8d');
  });
  it('does not overwrite an existing project query', () => {
    expect(playUrlWithProject('/games/x/?project=keep-me', 'other')).toBe('/games/x/?project=keep-me');
  });
  it('preserves absolute external-origin URLs completely unchanged', () => {
    const ext = 'https://cdn.example/play/game.html?v=1';
    expect(playUrlWithProject(ext, 'any-id')).toBe(ext);
    const extGames = 'https://cdn.example/games/sample-game/';
    expect(playUrlWithProject(extGames, 'any-id')).toBe(extGames);
  });
  it('does not pathname-only rewrite an external URL', () => {
    const ext = 'https://other.origin/games/x/?foo=1#h';
    expect(playUrlWithProject(ext, 'p1')).toBe(ext);
    expect(playUrlWithProject(ext, 'p1')).not.toMatch(/^\/games\//);
  });
  it('marks only relative Hub play paths as local', () => {
    expect(isLocalPlayUrl('/games/sample-run/')).toBe(true);
    expect(isLocalPlayUrl('https://cdn.example/games/sample-run/')).toBe(false);
    expect(isLocalPlayUrl('/project/x')).toBe(false);
  });
  it('validates project query ids', () => {
    expect(validatedProjectQueryId('sample-game-73da8d')).toBe('sample-game-73da8d');
    expect(validatedProjectQueryId('../evil')).toBeNull();
    expect(validatedProjectQueryId('')).toBeNull();
  });
});
