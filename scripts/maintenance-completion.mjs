// Publication is one stage of a maintenance run, never its completion signal.
export const requiredSections = ['discovery','existingResources','dependencies','editorial','recordings','validation','publication'];
const failureKinds = new Set(['http','timeout','authentication','rate-limit','unavailable-client','unavailable-content']);
const terminal = new Set(['complete','blocked','deferred']);
export function catalogReviewDateIssues(records, reviews) {
 return records.flatMap(record => {
  const review = reviews[record.id];
  if (review?.outcome !== 'reviewed') return [];
  const successful = Date.parse(review.lastSuccessfulReviewAt);
  return Number.isFinite(successful) && Date.parse(record.lastCheckedAt) === successful
   ? [] : [`${record.id}: visible checked date does not match successful source review`];
 });
}
export function assessMaintenance(run,{evidenceExists=()=>true,requiredScope={}}={}) {
 const issues=[],counts={complete:0,blocked:0,deferred:0,pending:0};
 if(!run?.date || !/^\d{4}-\d{2}-\d{2}$/.test(run.date))issues.push('Dated run required');
 for(const name of requiredSections){
  const section=run?.sections?.[name];
  if(!section?.expectedIds?.length || !Array.isArray(section.items)){issues.push(`${name}: expected scope and item outcomes required`);continue;}
  if(new Set(section.expectedIds).size!==section.expectedIds.length)issues.push(`${name}: duplicate expected scope`);
  for(const id of requiredScope[name]||[])if(!section.expectedIds.includes(id))issues.push(`${name}/${id}: missing from maintained scope`);
  const ids=new Set();
  for(const item of section.items){
   if(!item.id||ids.has(item.id)){issues.push(`${name}: missing or duplicate item identity`);continue;}ids.add(item.id);
   const label=`${name}/${item.id}`;
   if(!terminal.has(item.status)){counts.pending++;issues.push(`${label}: unfinished (${item.status||'pending'})`);continue;}
   counts[item.status]++;
   if(!item.evidence?.length||!item.evidence.every(e=>typeof e==='string'&&evidenceExists(e)))issues.push(`${label}: missing evidence`);
   if(!Number.isFinite(Date.parse(item.checkedAt))||item.checkedAt.slice(0,10)<run.date)issues.push(`${label}: stale or missing attempt`);
   if(item.status==='blocked'&&(!failureKinds.has(item.failureKind)||!item.reason||!item.nextAction||/not (read|checked|attempted)|unfinished|not yet/i.test(item.reason)))issues.push(`${label}: blocker requires observed failure and next action`);
   if(item.status==='deferred'&&(name!=='dependencies'||!item.reason||!item.targetVersion||!item.nextAction))issues.push(`${label}: deferral needs assessed dependency risk, target version and follow-up`);
   if(item.status==='complete'&&(item.pendingCount>0||item.coverageComplete!==true))issues.push(`${label}: declared coverage incomplete`);
  }
  for(const id of section.expectedIds)if(!ids.has(id))issues.push(`${name}/${id}: omitted from results`);
  for(const id of ids)if(!section.expectedIds.includes(id))issues.push(`${name}/${id}: absent from declared scope`);
 }
 return {status:issues.length?'incomplete':counts.blocked||counts.deferred?'completed-with-exceptions':'complete',counts,issues};
}
