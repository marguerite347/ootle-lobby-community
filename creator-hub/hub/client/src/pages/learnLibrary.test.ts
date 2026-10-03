import {describe,it,expect} from 'vitest';
import type {LearnView,Resource} from '../api';
import {learningResults} from './learnLibrary';
const native = {id:'native',native:true,title:'Tari templates',summary:'Compose a wallet',category:'Building blocks',creator:{name:'Example author'},tags:['ootle'],ecosystem:'tari-ootle',level:'beginner',format:'guide'} as Resource;
const external = {id:'external',native:false,title:'PlayCanvas reference',tags:[],ecosystem:'playcanvas',level:'advanced',format:'reference'} as unknown as Resource;
const data = {topics:[{id:'understand',label:'Understand',items:[native]},{id:'templates',label:'Templates',items:[native,external]}],other:[external],facets:{}} as unknown as LearnView;
describe('learning library',()=>{
 it('deduplicates multi-goal resources and puts Tari first',()=>expect(learningResults(data,new URLSearchParams()).map(r=>r.id)).toEqual(['native','external']));
 it('combines topic and metadata filters with accurate result counts',()=>{
  expect(learningResults(data,new URLSearchParams('topic=understand&ecosystem=playcanvas'))).toHaveLength(0);
  expect(learningResults(data,new URLSearchParams('level=advanced&format=reference&ecosystem=playcanvas')).map(r=>r.id)).toEqual(['external']);
 });
 it('searches all words across title, summary and tags, including missing summaries',()=>{
  expect(learningResults(data,new URLSearchParams('q=OOTLE+wallet')).map(r=>r.id)).toEqual(['native']);
  expect(learningResults(data,new URLSearchParams('q=PlayCanvas'))).toHaveLength(1);
 });
 it('matches 360 as its own token so 360° Platformer stays and 3600 drops out',()=>{
  const platformer={...external,id:'platformer',title:'360° Platformer',summary:'Orbit a round world'} as Resource;
  const longer={...external,id:'longer',title:'Room 3600',summary:'A longer room number'} as Resource;
  const mixed={...data,topics:[...data.topics,{id:'examples',label:'Examples',items:[platformer,longer]}]};
  expect(learningResults(mixed,new URLSearchParams('q=360')).map(r=>r.id)).toEqual(['platformer']);
 });
 it('preserves author and category search',()=>{
  expect(learningResults(data,new URLSearchParams('q=example+author'))).toHaveLength(1);
  expect(learningResults(data,new URLSearchParams('q=building+blocks'))).toHaveLength(1);
 });
 it('keeps the full catalog intact after filtering and treats unknown topics as empty',()=>{
  expect(learningResults(data,new URLSearchParams('topic=missing'))).toHaveLength(0);
  learningResults(data,new URLSearchParams('ecosystem=playcanvas'));
  expect(learningResults(data,new URLSearchParams())).toHaveLength(2);
  expect(data.topics[1].items).toHaveLength(2);
 });
});

it('filters skills within categories and deduplicates overlapping entries',()=>{
 const skill={...external,id:'skill',learningKind:'skill',format:'skill'} as Resource;
 const mixed={...data,categories:[{id:'engines',label:'Engines',items:[external,skill,skill]}]};
 expect(learningResults(mixed,new URLSearchParams('category=engines&learningKind=skill')).map(r=>r.id)).toEqual(['skill']);
 expect(learningResults(mixed,new URLSearchParams('category=missing'))).toHaveLength(0);
 expect(mixed.categories[0].items).toHaveLength(3);
});
