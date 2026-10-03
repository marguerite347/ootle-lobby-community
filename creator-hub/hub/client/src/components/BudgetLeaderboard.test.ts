import {describe,it,expect} from 'vitest';
import {rankBudgetBuilds,type BudgetBuild} from './BudgetLeaderboard';
const build=(id:string,cashUsd:number,extra:Partial<BudgetBuild>={}):BudgetBuild=>({id,creatorId:id,creatorName:id,title:id,description:'A game',version:'v1',scope:'All attempts',demoUrl:'https://example.com',category:'game',stage:'prototype',costs:{ai:cashUsd,assets:0,other:0},cashUsd,creditUsd:null,hours:null,revision:1,recommendations:1,...extra});
describe('Budget standings',()=>{
 it('requires a recommendation and separates category and stage',()=>{
  const entries=[build('pending',0,{recommendations:0}),build('app',0,{category:'app'}),build('release',0,{stage:'release'}),build('valid',5),build('invalid',NaN)];
  expect(rankBudgetBuilds(entries,'game','prototype').map(entry=>entry.id)).toEqual(['valid']);
 });
 it('ranks ascending, shares ties and does not turn unknown credits into zero',()=>{
  const result=rankBudgetBuilds([build('z',20),build('b',0),build('a',0)],'game','prototype');
  expect(result.map(entry=>[entry.id,entry.rank])).toEqual([['a',1],['b',1],['z',3]]);
  expect(result[0].creditUsd).toBeNull();
 });
});
