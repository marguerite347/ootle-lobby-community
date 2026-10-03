import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {TRELLO_BOARD_ID,normalizeSnapshot,readSnapshot,writeSnapshot} from '../trelloSnapshot.mjs';
const input={boardId:TRELLO_BOARD_ID,syncedAt:new Date().toISOString(),hasNextPage:false,lists:[{id:'list',name:'Planned',cards:[{id:'c',name:'Launch',url:'https://trello.com/c/abc123',description:'private omitted',due:{date:null,complete:false},labels:[{name:'',color:'yellow'}]}]}]};
test('connector normalization strips extra private content and rejects partial/wrong board data',()=>{
 const snapshot=normalizeSnapshot(input);assert(!JSON.stringify(snapshot).includes('private omitted'));assert.equal(snapshot.lists[0].cards[0].labels[0].name,'yellow');
 assert.throws(()=>normalizeSnapshot({...input,hasNextPage:true}));assert.throws(()=>normalizeSnapshot({...input,boardId:'other'}));
 const duplicate=structuredClone(input);duplicate.lists[0].cards.push(duplicate.lists[0].cards[0]);assert.throws(()=>normalizeSnapshot(duplicate));
});
test('atomic private cache can be replaced with an empty successful read',()=>{
 const dir=mkdtempSync(path.join(os.tmpdir(),'trello-snapshot-test-'));const file=path.join(dir,'cache.json');
 try {assert.equal(readSnapshot(file),null);writeSnapshot(normalizeSnapshot(input),file);assert.equal(statSync(file).mode&0o777,0o600);assert.equal(readSnapshot(file).lists.length,1);writeSnapshot(normalizeSnapshot({...input,lists:[]}),file);assert.deepEqual(readSnapshot(file).lists,[]);}finally{rmSync(dir,{recursive:true});}
});
