import test from 'node:test';
import assert from 'node:assert/strict';
import {contestRegistry,contestCreators,withContestEntries} from '../contestEntries.mjs';
test('all fourteen reviewed submissions have unique profiles and attributed creators',()=>{
 assert.equal(contestRegistry.entries.length,14);
 assert.equal(contestRegistry.streamPostIds.length,contestRegistry.totalPosts);
 const original={id:'tari-ootle:app:shadowtix',title:'ShadowTix',tags:['wiki'],summary:'Latest wiki information',license:null};
 const records=withContestEntries([original]);
 assert.equal(records.length,14);
 assert.equal(new Set(records.map(record=>record.id)).size,14);
 const shadow=records.find(record=>record.id===original.id);
 assert.equal(shadow.summary,original.summary);
 assert.equal(shadow.contest.socialUrl,null);
 assert.equal(shadow.contest.paymentAddressPresent,true);
 assert.equal(contestCreators.length,12);
 assert.ok(records.every(record=>contestCreators.some(creator=>record.creator.url==='/creators/'+creator.id)));
 assert.ok(records.every(record=>!JSON.stringify(record.contest).includes('12N4M9')),'payment addresses stay in source posts');
 assert.equal(withContestEntries(records).length,14,'repeated enrichment does not duplicate entries');
});

test('late entries keep distinct submissions, shared creators and follow-up provenance', () => {
 const records = withContestEntries([]);
 const seal = contestCreators.find(creator => creator.id === 'forum-sealclubber');
 assert.equal(seal.projects.filter(url => url.startsWith('/resource/')).length, 2);
 assert.equal(new Set(contestCreators.map(creator => creator.id)).size, contestCreators.length);
 assert.deepEqual(records.find(record => record.contest.slug === 'wunschswap').contest.updates.map(update => update.postNumber), [23, 26, 34]);
 assert.deepEqual(records.find(record => record.contest.slug === 'ootle-surveys').contest.updates.map(update => update.postNumber), [22, 28]);
 assert.equal(records.find(record => record.contest.slug === 'outruna').network, 'Tari Mainnet and EVM (submission-reported)');
 assert.match(records.find(record => record.contest.slug === 'threshold-bounties').contest.notes, /historical proof archive/);
});
