import {it,expect} from 'vitest';
import {compareProjectStates} from './versionCompare';
import type {ProjectState} from './api';
const state=(components:any[]):ProjectState=>({components,templateId:null,notes:'',updatedAt:''});
it('compares actual component identities, settings and removed references',()=>{
 const result=compareProjectStates(state([{id:'a',title:'Wallet',setting:1},{id:'b',title:'Old'}]),state([{id:'a',title:'Wallet',setting:2},{id:'c',title:'New'}]));
 expect(result.added).toEqual(['New']);expect(result.removed).toEqual(['Old']);expect(result.changed).toEqual(['Wallet']);
});
it('does not mistake object key order for a recipe change',()=>{
 expect(compareProjectStates(state([{id:'a',settings:{x:1,y:2}}]),state([{settings:{y:2,x:1},id:'a'}])).changed).toEqual([]);
});
