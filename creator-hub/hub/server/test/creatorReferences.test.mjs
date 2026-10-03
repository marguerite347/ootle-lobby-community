import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fetchLive} from '../connectors/creatorReferences.mjs';
test('references have unique IDs, correct kinds and no implied Tari or free-use certification',async()=>{
 const {records}=await fetchLive();
 assert.equal(new Set(records.map(r=>r.id)).size,records.length);
 assert.ok(records.length>=16);
 for(const r of records){assert.equal(r.tariCompatible,null);assert.equal(r.provenance.freshness,'provisional');if(r.repoUrl)assert.match(r.repoUrl,/^https:\/\/github.com\//);}
 assert.equal(records.find(r=>r.title.startsWith('Forbidden Solitaire')).type,'learn');
 assert.equal(records.find(r=>r.title.startsWith('Balatro Feel')).type,'component');
 assert.equal(records.find(r=>r.title==='VoiceStudio').type,'asset');
 assert.equal(records.find(r=>r.title==='Shadertoy').repoUrl,null);
});
