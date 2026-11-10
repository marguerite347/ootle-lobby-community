import test from 'node:test';
import assert from 'node:assert/strict';
import {inNetwork,validateNetworkStatus} from '../creator-hub/hub/shared/networkStatus.mjs';
const entry={ref:'known-project',state:'testnet',testnetUrl:'https://example.com/testnet',checkedAt:'2026-11-10T14:00:00Z',evidenceUrl:'https://example.com/announcement',evidence:'Creator identifies Esmeralda.',mainnetPlan:'Mainnet launch planned tomorrow.'};
const validate=e=>validateNetworkStatus({schemaVersion:1,entries:e},new Set(['known-project']));
test('a mainnet plan never promotes a testnet listing',()=>{
 validate([entry]);assert.equal(inNetwork(entry,'mainnet'),false);assert.equal(inNetwork(entry,'testnet'),true);
 assert.throws(()=>validate([{...entry,state:'mainnet',mainnetUrl:'https://example.com'}]),/deployment evidence/);
});
test('mainnet and both-network listings require dated deployment evidence and separate destinations',()=>{
 const mainnet={...entry,state:'mainnet',mainnetUrl:'https://example.com/mainnet',deploymentEvidence:{url:'https://example.com/mainnet/deployment',observedAt:entry.checkedAt,detail:'Mainnet network and deployment confirmed.'}};
 validate([mainnet]);assert.equal(inNetwork(mainnet,'mainnet'),true);assert.equal(inNetwork(mainnet,'testnet'),false);
 const both={...mainnet,state:'both'};validate([both]);assert.ok(inNetwork(both,'mainnet')&&inNetwork(both,'testnet'));
 assert.throws(()=>validate([{...both,testnetUrl:undefined}]),/own URL/);
});
test('unconfirmed states stay out of live lists and invalid or duplicate identities fail validation',()=>{
 assert.equal(inNetwork({...entry,state:'unconfirmed'},'mainnet'),false);
 assert.throws(()=>validate([entry,entry]),/unique/);
 assert.throws(()=>validate([{...entry,ref:'invented-project'}]),/existing catalog/);
 assert.throws(()=>validate([{...entry,evidenceUrl:'javascript:alert(1)'}]),/dated source/);
 assert.throws(()=>validate([{...entry,state:'unconfirmed',testnetUrl:'javascript:alert(1)'}]),/HTTPS/);
});

test('showcase curation requires safe destinations and never changes network classification',()=>{
 const showcased={...entry,showcase:{url:'https://example.com/demo',label:'Sandbox demo',summary:'Try the demo.'}};
 validate([showcased]);assert.equal(inNetwork(showcased,'mainnet'),false);
 assert.throws(()=>validate([{...showcased,showcase:{...showcased.showcase,url:'javascript:alert(1)'}}]),/HTTPS/);
 assert.throws(()=>validate([{...showcased,showcase:{...showcased.showcase,label:''}}]),/plain-text/);
});
