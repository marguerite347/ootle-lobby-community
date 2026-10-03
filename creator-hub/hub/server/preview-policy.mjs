// Generated gallery media needs resource-specific evidence and a visual review.
export function approvedGeneratedPreview(entry) {
 const proof=entry?.review;
 return entry?.source==='cover' && typeof entry.id==='string' && !!entry.id &&
  proof?.policyVersion===1 && proof.resourceId===entry.id &&
  proof.faithfulToSource===true && proof.uniqueVisual===true &&
  typeof proof.reviewer==='string' && !!proof.reviewer.trim() &&
  typeof proof.reviewedAt==='string' && Number.isFinite(Date.parse(proof.reviewedAt)) &&
  typeof proof.sceneDescription==='string' && proof.sceneDescription.trim().length>=30 &&
  Array.isArray(proof.references) && proof.references.length>0 && proof.references.every(x=>{
   try{return ['http:','https:'].includes(new URL(x).protocol);}catch{return false;}
  }) && /^[a-f0-9]{64}$/.test(proof.videoSha256||'');
}
