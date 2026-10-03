export const stages = ['brief', 'storyboard', 'sample', 'final'];
export const stageTitles = {brief:'Story and script', storyboard:'Shots and assets', sample:'10–15 second proof', final:'Full-cut approval'};
const fail = message => {throw Object.assign(new Error(message), {status:400});};
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const text = (value, max=12000) => typeof value === 'string' && value.length <= max;
export function emptyReview() {
  return {version:1, gates:Object.fromEntries(stages.map(id=>[id,{content:'',artifact:'',status:'pending',reviewer:'',feedback:''}])), attempts:[]};
}
export function validateReview(review) {
  if (!object(review) || review.version!==1 || !object(review.gates) || !Array.isArray(review.attempts) || review.attempts.length>200) fail('Invalid production review');
  for (const id of stages) {
    const gate=review.gates[id];
    if (!object(gate) || !text(gate.content) || !text(gate.artifact,2000) || !text(gate.reviewer,120) || !text(gate.feedback,4000) || !['pending','approved','changes'].includes(gate.status)) fail('Invalid review gate');
    if (gate.status==='approved' && (!gate.content.trim() || !gate.artifact.trim() || !gate.reviewer.trim())) fail('Approval requires content, an exact artifact/version and a reviewer');
  }
  for (const attempt of review.attempts) {
    if (!object(attempt) || !text(attempt.shot,160) || !text(attempt.provider,160) || !text(attempt.unit,80) || !text(attempt.feedback,4000) || !text(attempt.artifact,2000) || !['pending','accepted','rejected'].includes(attempt.result)) fail('Invalid attempt');
    for (const key of ['cost','minutes','corrections']) if (attempt[key]!==null && (typeof attempt[key]!=='number' || !Number.isFinite(attempt[key]) || attempt[key]<0 || attempt[key]>1e9 || key==='corrections'&&!Number.isInteger(attempt[key]))) fail('Unknown measurements must be null; known measurements must be nonnegative');
    if (attempt.cost!==null && (!attempt.provider.trim() || !attempt.unit.trim())) fail('Cost needs a provider and unit');
  }
  return review;
}
// A content edit invalidates that stage and every downstream creative decision.
// These are recorded attestations, not authenticated reviewer identities.
export function reconcileReview(next, previous) {
  validateReview(next);
  if (previous) validateReview(previous);
  const result=structuredClone(next);
  let invalidated=false;
  for (const [index,id] of stages.entries()) {
    const gate=result.gates[id], old=previous?.gates[id];
    if (old && (old.content!==gate.content || old.artifact!==gate.artifact)) invalidated=true;
    if (invalidated) {gate.status='pending';gate.reviewer='';}
    if (gate.status==='approved') {
      if (!old || !stages.slice(0,index).every(key=>previous.gates[key].status==='approved' && result.gates[key].status==='approved')) fail('Save the artifacts first and approve stages in order');
    }
    if (gate.status!=='approved') invalidated=true;
  }
  return result;
}
export function renderBlockers(review, mode = 'full') {
  try {validateReview(review);} catch {return ['A valid saved production review is required'];}
  return stages.slice(0,mode === 'proof' ? 2 : 3).filter(id=>review.gates[id].status!=='approved').map(id=>`${stageTitles[id]} needs approval`);
}
