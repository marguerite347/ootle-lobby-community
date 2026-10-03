import {expect,it} from 'vitest';
import {validRecipeSnapshot} from './recipeSnapshot';
it('rejects incomplete historical manifests without dereferencing missing fields',()=>{
 for(const value of [null,{}, {recipe:{id:'x',version:'1',title:'x'},parameters:{},components:[],adapter:{status:'x'}}]) expect(validRecipeSnapshot(value)).toBe(false);
 for(const adapter of [false,0,'']) expect(validRecipeSnapshot({recipe:{id:'x',version:'1',title:'x'},parameters:{},components:[],adapter})).toBe(false);
 expect(validRecipeSnapshot({recipe:{id:'x',version:'1',title:'x'},parameters:{},components:[],adapter:{status:'x',steps:[],limitations:[]}})).toBe(true);
});
