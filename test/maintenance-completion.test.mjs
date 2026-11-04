import {test} from 'node:test';import assert from 'node:assert/strict';
import {assessMaintenance,requiredSections,catalogReviewDateIssues,discoveryScope} from '../scripts/maintenance-completion.mjs';
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
 Object.assign(i,{reason:'HTTP 401 requires source login',failureKind:'authentication',nextAction:'Owner can restore existing source session',retryAt:'2026-10-30T10:00:00Z'});assert.equal(assessMaintenance(r).status,'completed-with-exceptions');
 assert.equal(assessMaintenance(r,{evidenceExists:()=>false}).status,'incomplete');
 i.checkedAt='2026-10-28T10:00:00Z';assert.equal(assessMaintenance(r).status,'incomplete');
});
test('dependency deferrals need actual assessment and cannot excuse unread source streams',()=>{
 const r=fixture();Object.assign(r.sections.dependencies.items[0],{status:'deferred',reason:'Version requires Node 26; deployment runs Node 22',targetVersion:'9.0.0',nextAction:'Migrate runtime and run integration tests'});assert.equal(assessMaintenance(r).status,'completed-with-exceptions');
 r.sections.discovery.items[0].status='deferred';assert.equal(assessMaintenance(r).status,'incomplete');
});
test('all required evidence and coverage can complete the run',()=>{assert.equal(assessMaintenance(fixture()).status,'complete');});

test('retry plans and concrete migration assessments cannot be replaced by bookkeeping',()=>{
 const r=fixture(),i=r.sections.discovery.items[0];
 Object.assign(i,{status:'blocked',reason:'HTTP 404 from original source',failureKind:'http',nextAction:'Retry original source'});
 assert.match(assessMaintenance(r).issues.join(),/retry date/);
 i.retryAt='2026-10-29T09:00:00Z';assert.match(assessMaintenance(r).issues.join(),/retry date/);
 i.retryAt='2026-10-30T10:00:00Z';assert.equal(assessMaintenance(r).status,'completed-with-exceptions');
 const d=r.sections.dependencies.items[0];Object.assign(d,{status:'deferred',reason:'Assessment required for this major',targetVersion:'9.0.0',nextAction:'Assess migration'});
 assert.match(assessMaintenance(r).issues.join(),/assessed dependency risk/);
 Object.assign(i,{status:'complete',pendingCount:0,pending:['Unread replies']});assert.match(assessMaintenance(r).issues.join(),/declared coverage incomplete/);
});

test('declared run scope cannot omit maintained catalog or dependency identities',()=>{
 const r=fixture();const result=assessMaintenance(r,{requiredScope:{existingResources:['a','missing-project'],dependencies:['missing-package']}});
 assert.equal(result.status,'incomplete');assert.match(result.issues.join(),/missing-project: missing from maintained scope/);
});


test('held and deduplicated discoveries cannot disappear before catalog publication',()=>{
 const ledger={sources:[{id:'a'}],newReviewQueue:[
  {id:'held-announcement',status:'held-source-unavailable'},
  {repository:'https://github.com/example/project.git',canonicalResource:'project:existing',status:'deduplicated'},
  {id:'a'}
 ]};
 const scope=discoveryScope(ledger);
 assert.deepEqual(scope,['a','held-announcement','github-candidate:example/project']);
 const result=assessMaintenance(fixture(),{requiredScope:{discovery:scope}});
 assert.equal(result.status,'incomplete');
 assert.match(result.issues.join(),/held-announcement: missing from maintained scope/);
 assert.match(result.issues.join(),/github-candidate:example\/project: missing from maintained scope/);
 assert.throws(()=>discoveryScope({newReviewQueue:[{canonicalResource:'project:existing'}]}),/stable source identity/);
});
