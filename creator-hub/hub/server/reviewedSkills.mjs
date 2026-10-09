import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const reviewed=JSON.parse(readFileSync(new URL('../shared/reviewedSkills.json',import.meta.url),'utf8'));
export function verifyReviewedFiles(id,files) {
 const expected=reviewed[id];
 const actual=Object.fromEntries(Object.entries(files).map(([name,body])=>[name,createHash('sha256').update(body).digest('hex')]));
 if(!expected||Object.keys(expected).length!==Object.keys(actual).length||Object.entries(expected).some(([name,digest])=>actual[name]!==digest))throw Object.assign(new Error('Bundle content needs maintainer review.'),{status:409});
 return actual;
}
export function verifyReviewedFile(id,name,body) {
 if(!reviewed[id]||reviewed[id][name]!==createHash('sha256').update(body).digest('hex'))throw Object.assign(new Error('Skill content needs maintainer review.'),{status:409});
 return body;
}

export const isReviewedSkill=id=>Object.hasOwn(reviewed,id);
