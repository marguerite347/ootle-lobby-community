import {describe, expect, it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReleaseNext, claimsLocalPlayable} from './releaseNext';
import type {Project} from './api';

const shared = {id:'orig', title:'Original', release:{playUrl:'/games/example/', title:'Example', sourceUrl:'https://example.com/src', walletStatus:'Local play'}} as Project;
const parentFork = {id:'fork', forkedFrom:'orig', release:{playUrl:'/games/example/', title:'Example', walletStatus:'Local play'}} as Project;
const ownBuild = {id:'child', forkedFrom:'orig', release:{playUrl:'/games/child/', projectId:'child', title:'Child build', walletStatus:'Local play'}} as Project;
const draft = {id:'draft', title:'Draft', release:null} as unknown as Project;

describe('release next step', () => {
  it('shows Play for a shared release without claiming a local playable', () => {
    const html = renderToStaticMarkup(<ReleaseNext project={shared}/>);
    expect(claimsLocalPlayable(shared)).toBe(false);
    expect(html).toContain('href="/games/example/?project=orig"');
    expect(html).toContain('data-shipping="curated-play"');
    expect(html).not.toContain('own local playable');
    expect(html).not.toContain('Riff');
  });

  it('does not offer parent Play on a fork without its own release', () => {
    const html = renderToStaticMarkup(<ReleaseNext project={parentFork}/>);
    expect(html).not.toContain('href="/games/example/');
    expect(html).toContain('does not have its own playable');
  });

  it('claims a local playable only for this project’s artifact', () => {
    const html = renderToStaticMarkup(<ReleaseNext project={ownBuild}/>);
    expect(claimsLocalPlayable(ownBuild)).toBe(true);
    expect(html).toContain('own local playable');
  });

  it('shows an unpublished draft note when there is no release', () => {
    const html = renderToStaticMarkup(<ReleaseNext project={draft}/>);
    expect(html).toContain('Draft saved. Nothing published yet.');
    expect(html).not.toContain('Play');
  });
});
