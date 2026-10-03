import {describe,it,expect} from 'vitest';
import {discoveryResults} from './discovery';
import type {Resource} from '../api';
const rows=[{id:'a',title:'Tari template',native:true,type:'starter',ecosystem:'tari-ootle',readiness:'conceptual',creator:{name:'Fox'},tags:['wallet'],popularity:{score:1}},{id:'b',title:'Game',native:false,type:'app',ecosystem:'creative',readiness:'runnable-example',popularity:{score:20}}] as Resource[];
describe('Discover filtering',()=>{
 it('keeps Tari first and supports score ordering without mutating input',()=>{expect(discoveryResults(rows,new URLSearchParams()).map(r=>r.id)).toEqual(['a','b']);expect(discoveryResults(rows,new URLSearchParams('sort=popular')).map(r=>r.id)).toEqual(['b','a']);expect(rows[0].id).toBe('a');});
 it('matches author and tags with all search words',()=>expect(discoveryResults(rows,new URLSearchParams('q=fox+wallet'))).toHaveLength(1));
 it('intersects filters and retains native deep link semantics',()=>{expect(discoveryResults(rows,new URLSearchParams('type=app&ecosystem=tari-ootle'))).toHaveLength(0);expect(discoveryResults(rows,new URLSearchParams('native=false')).map(r=>r.id)).toEqual(['b']);});
});
it('honors exact source tags from source-card browse links',()=>{
 expect(discoveryResults(rows,new URLSearchParams('tag=wallet')).map(row=>row.id)).toEqual(['a']);
 expect(discoveryResults(rows,new URLSearchParams('tag=missing'))).toEqual([]);
});

it('matches 360 as its own token so 360° Platformer stays and 3600 drops out',()=>{
 const catalog=[
  {id:'platformer',title:'360° Platformer',native:false,type:'starter',ecosystem:'gdevelop',readiness:'runnable-example'},
  {id:'longer',title:'Room 3600',summary:'A longer room number',native:false,type:'app',ecosystem:'creative',readiness:'conceptual'},
 ] as Resource[];
 expect(discoveryResults(catalog,new URLSearchParams('q=360')).map(row=>row.id)).toEqual(['platformer']);
});
