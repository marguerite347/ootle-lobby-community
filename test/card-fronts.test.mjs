import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const internalReviewWording=/\b(?:untested|unverified|not\s+(?:(?:independently|yet)\s+)?(?:tested|verified)|(?:runtime|hosting|availability)\s+(?:has\s+)?not\s+been\s+verified)\b/i;
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
test('every curated project and builder reference has distinct authored front copy',()=>{
 const entries=['projects','community-projects','submissions/october-2026'].flatMap(folder=>readdirSync(new URL('../content/'+folder+'/',import.meta.url)).filter(f=>f.endsWith('.json')).map(f=>read('content/'+folder+'/'+f)));
 const catalog=read('creator-hub/hub/shared/ecosystemResources.json');
 for(const entry of [...entries,...catalog.records,...catalog.opportunities]){
  assert.ok(entry.cardSummary?.trim(),`${entry.title}: missing card summary`);
  assert.ok(entry.cardSummary.length<=160,`${entry.title}: front copy too long`);
  assert.ok(entry.cardStatus===undefined || (entry.cardStatus.trim()&&entry.cardStatus.length<=80),`${entry.title}: empty or overlong status`);
  for (const field of ['title','cardSummary','cardStatus']) {
   assert.doesNotMatch(entry[field]||'',internalReviewWording,`${entry.title}: ${field} must describe the resource, not internal testing`);
   assert.doesNotMatch(entry[field]||'',/no playable demo|not deployed|skill links unavailable/i,`${entry.title}: put dated source-scoped absence observations in Details`);
  }
  assert.ok(entry.summary?.trim(),`${entry.title}: preserve full description`);
 }
 // Availability labels may change after a real source review; do not freeze a project in its current state.
 assert.match(catalog.records.find(x=>x.key==='caravel-burn-wallet').cardStatus,/Testnet.*Irreversible/);
});

test('catalog introduction uses discovery copy',()=>{
 const source=readFileSync(new URL('../creator-hub/hub/client/src/components/EcosystemResources.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(source,internalReviewWording);
 assert.doesNotMatch(source,/runtime limits are listed/);
});
