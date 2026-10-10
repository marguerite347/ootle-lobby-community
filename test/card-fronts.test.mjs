import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
test('every curated project and builder reference has distinct authored front copy',()=>{
 const entries=['projects','community-projects','submissions/october-2026'].flatMap(folder=>readdirSync(new URL('../content/'+folder+'/',import.meta.url)).filter(f=>f.endsWith('.json')).map(f=>read('content/'+folder+'/'+f)));
 const catalog=read('creator-hub/hub/shared/ecosystemResources.json');
 for(const entry of [...entries,...catalog.records,...catalog.opportunities]){
  assert.ok(entry.cardSummary?.trim(),`${entry.title}: missing card summary`);
  assert.ok(entry.cardSummary.length<=160,`${entry.title}: front copy too long`);
  assert.ok(entry.cardStatus?.trim()&&entry.cardStatus.length<=80,`${entry.title}: missing or overlong status`);
  assert.ok(entry.summary?.trim(),`${entry.title}: preserve full description`);
 }
 const candy=entries.find(x=>x.slug==='candy-summoner');assert.match(candy.cardStatus,/No playable demo/);
 assert.match(entries.find(x=>x.slug==='ghostkey').cardStatus,/Source only/);
 assert.match(catalog.records.find(x=>x.key==='caravel-burn-wallet').cardStatus,/Testnet.*Irreversible/);
});
