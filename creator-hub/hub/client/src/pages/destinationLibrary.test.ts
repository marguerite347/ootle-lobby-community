import {describe, expect, it} from 'vitest';
import type {LearnView, Resource} from '../api';
import {destinationLink, discoveryLibrary, guideLibrary} from './destinationLibrary';
const asset = {id:'asset', type:'asset', ecosystem:'creative', readiness:'conceptual'} as Resource;
const guide = {id:'guide', type:'learn', learningKind:'guide', ecosystem:'tari-ootle', format:'guide', level:'beginner'} as Resource;
const skill = {id:'skill', type:'learn', learningKind:'skill', ecosystem:'creative', format:'skill'} as Resource;
describe('destination boundaries', () => {
  it('keeps Discover focused on usable resources with matching counts and facets', () => {
    const items = [asset, guide, skill];
    const result = discoveryLibrary(items);
    expect(result.items).toEqual([asset]);
    expect(result.count).toBe(1);
    expect(result.facets.type).toEqual({asset:1});
    expect(result.facets.ecosystem).toEqual({creative:1});
    expect(items).toHaveLength(3);
  });
  it('removes downloadable skills from every Learn group without inflating overlapping counts', () => {
    const data = {topics:[{id:'tari',items:[guide,skill]}], categories:[{id:'engines',items:[guide,skill]}],other:[guide,skill],facets:{format:{skill:1,guide:1}},count:2} as unknown as LearnView;
    const result = guideLibrary(data);
    expect(result.topics[0].items).toEqual([guide]);
    expect(result.categories![0].items).toEqual([guide]);
    expect(result.other).toEqual([guide]);
    expect(result.count).toBe(1);
    expect(result.facets.format).toEqual({guide:1});
    expect(data.other).toHaveLength(2);
  });
  it('routes imported tool-directory entries to Discover without changing source metadata', () => {
    const tool = {...guide, id:'tool', category:'Tools / Software / Audio Tools', format:'reference', tags:['game-resource-lists']};
    expect(discoveryLibrary([tool, guide]).items).toEqual([{...tool,type:'tool'}]);
    const data: LearnView = {generatedAt:null,topics:[],other:[tool,guide],count:2,facets:{}};
    expect(guideLibrary(data).other).toEqual([guide]);
    expect(tool.type).toBe('learn');
  });
  it('includes commercial genre study references without relabeling them as reusable tools or leaking other guides', () => {
    const reference = {...guide, id:'genre-reference:example', ecosystem:'creative', format:'reference', tags:['genre-reference', 'reference-only'], title:'Example game', summary:'Commercial design reference only.'};
    const mislabeledGuide = {...guide, tags:['genre-reference']};
    const result = discoveryLibrary([reference, asset, guide, skill, mislabeledGuide]);
    expect(result.items).toEqual([reference, asset]);
    expect(result.count).toBe(2);
    expect(result.facets.type).toEqual({learn:1, asset:1});
    expect(reference.type).toBe('learn');
  });
  it('preserves useful search context across destinations and drops incompatible filters', () => {
    expect(destinationLink('/learn',new URLSearchParams('q=game+feel&ecosystem=creative&type=learn&readiness=conceptual'),['q','ecosystem'])).toBe('/learn?q=game+feel&ecosystem=creative');
    expect(destinationLink('/skills',new URLSearchParams('category=audio&learningKind=skill'),['q','category'])).toBe('/skills?category=audio');
    expect(destinationLink('/learn',new URLSearchParams(),['q'])).toBe('/learn');
  });
});
