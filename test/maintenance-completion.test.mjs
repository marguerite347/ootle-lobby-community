import {test} from 'node:test';import assert from 'node:assert/strict';
import {assessMaintenance,requiredSections,catalogReviewDateIssues} from '../scripts/maintenance-completion.mjs';
const fixture=()=>({date:'2026-10-29',sections:Object.fromEntries(requiredSections.map(s=>[s,{expectedIds:['a'],items:[{id:'a',status:'complete',checkedAt:'2026-10-29T10:00:00Z',evidence:['read.json'],coverageComplete:true}]}]))});
test('visible review dates track successful reads without refreshing blocked entries',()=>{
 const reviews={a:{outcome:'reviewed',lastSuccessfulReviewAt:'2026-10-29T10:00:00Z'},b:{outcome:'blocked'}};
 assert.equal(catalogReviewDateIssues([{id:'a',lastCheckedAt:'2026-10-23T10:00:00Z'}],reviews).length,1);
 assert.deepEqual(catalogReviewDateIssues([{id:'a',lastCheckedAt:'2026-10-29T10:00:00.000Z'},{id:'b',lastCheckedAt:'2026-10-23T10:00:00Z'}],reviews),[]);
 assert.equal(catalogReviewDateIssues([{id:'a',lastCheckedAt:'2026-10-30T10:00:00Z'}],reviews).length,1);
});
test('a shipped release cannot hide an unfinished source or omitted scope',()=>{
 const r=fixture();r.sections.discovery.items[0].status='pending';assert.equal(assessMaintenance(r).status,'incomplete');
 r.sections.discovery.items=[];assert.match(assessMaintenance(r).issues.join(),/omitted/);
 delete r.sections.dependencies;assert.equal(assessMaintenance(r).status,'incomplete');
});
test('only evidenced external failures are exceptions; incomplete work stays pending',()=>{
 const r=fixture(),i=r.sections.discovery.items[0];Object.assign(i,{status:'blocked',reason:'Not read in this run'});assert.equal(assessMaintenance(r).status,'incomplete');
 Object.assign(i,{reason:'HTTP 401 requires source login',failureKind:'authentication',nextAction:'Owner can restore existing source session'});assert.equal(assessMaintenance(r).status,'completed-with-exceptions');
 assert.equal(assessMaintenance(r,{evidenceExists:()=>false}).status,'incomplete');
 i.checkedAt='2026-10-28T10:00:00Z';assert.equal(assessMaintenance(r).status,'incomplete');
});
test('dependency deferrals need actual assessment and cannot excuse unread source streams',()=>{
 const r=fixture();Object.assign(r.sections.dependencies.items[0],{status:'deferred',reason:'Version requires Node 26; deployment runs Node 22',targetVersion:'9.0.0',nextAction:'Migrate runtime and run integration tests'});assert.equal(assessMaintenance(r).status,'completed-with-exceptions');
 r.sections.discovery.items[0].status='deferred';assert.equal(assessMaintenance(r).status,'incomplete');
});
test('all required evidence and coverage can complete the run',()=>{assert.equal(assessMaintenance(fixture()).status,'complete');});

test('declared run scope cannot omit maintained catalog or dependency identities',()=>{
 const r=fixture();const result=assessMaintenance(r,{requiredScope:{existingResources:['a','missing-project'],dependencies:['missing-package']}});
 assert.equal(result.status,'incomplete');assert.match(result.issues.join(),/missing-project: missing from maintained scope/);
});
