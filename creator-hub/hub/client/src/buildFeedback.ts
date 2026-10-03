export const feedbackOutcomes=['Blocked','Playable prototype','Published and discoverable','Abandoned'] as const;
export type BuildFeedback={goal:string;context:string;outcome:string;skills:string;worked:string;friction:string;improvement:string;evidence:string;minutes:string;corrections:string;wastedGenerations:string;credits:string};
export const emptyFeedback:BuildFeedback={goal:'',context:'',outcome:'Blocked',skills:'',worked:'',friction:'',improvement:'',evidence:'',minutes:'',corrections:'',wastedGenerations:'',credits:''};
export function feedbackError(report:BuildFeedback):string{
 if(!report.goal.trim()||!report.context.trim()||!report.friction.trim())return 'Add the build goal, environment and experience to review.';
 if(!feedbackOutcomes.includes(report.outcome as typeof feedbackOutcomes[number]))return 'Choose a build outcome.';
 if(Object.values(report).some(value=>value.length>2500))return 'Keep each answer under 2,500 characters; link longer sanitized evidence.';
 for(const field of ['minutes','corrections','wastedGenerations','credits'] as const){const value=report[field];if(value!==''&&(!Number.isFinite(Number(value))||Number(value)<0||(['corrections','wastedGenerations'].includes(field)&&!Number.isInteger(Number(value)))))return 'Use nonnegative measured values; leave unknown metrics blank.';}
 const text=Object.values(report).join('\n');
 if(/-----BEGIN .*PRIVATE KEY-----|\b(?:sk-|hf_)[A-Za-z0-9_-]{16,}|\bBearer\s+[A-Za-z0-9._-]{12,}|\/(?:Users|home)\/[^\s]+/i.test(text))return 'Remove credentials or private machine paths before sharing.';
 return '';
}
export function feedbackMarkdown(report:BuildFeedback):string{
 const sections=[['Build goal',report.goal],['Project, revision and environment',report.context],['Outcome',report.outcome],['Skills and resources actually used',report.skills||'Not reported; do not infer skill use.'],['What worked',report.worked||'Not reported'],['Friction / reproduction / expected versus actual',report.friction],['Suggested improvement',report.improvement||'Needs reviewer investigation'],['Sanitized evidence',report.evidence||'Not supplied']];
 return '# Creator build experience\n\n'+sections.map(([title,value])=>`## ${title}\n${value.trim()}`).join('\n\n')+`\n\n## Measured results (unknown is not zero)\n- Minutes: ${report.minutes||'Unknown'}\n- Repeated corrections: ${report.corrections||'Unknown'}\n- Wasted generations: ${report.wastedGenerations||'Unknown'}\n- Credits (include provider/units in context): ${report.credits||'Unknown'}\n\n## Review status\nUnreviewed, creator/agent-reported evidence. Not a verified lesson or proof of model learning.\n\n## Maintainer follow-up\n- [ ] Classify and reproduce or request missing evidence\n- [ ] Link actionable issue/PR and acceptance check\n- [ ] Verify change with a comparable follow-up build\n- [ ] Update the affected guide/skill only after review and trial\n`;
}
export function feedbackIssueUrl(report:BuildFeedback,body:string):string{
 const url=new URL('https://github.com/marguerite347/ootle-lobby/issues/new');
 url.searchParams.set('title',`[Build experience] ${report.goal.slice(0,80)}`);
 url.searchParams.set('body',body);
 return url.toString();
}
