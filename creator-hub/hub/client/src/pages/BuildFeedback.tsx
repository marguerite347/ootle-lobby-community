import {useState} from 'react';
import {Link} from 'react-router-dom';
import {emptyFeedback,feedbackError,feedbackMarkdown,feedbackIssueUrl,feedbackOutcomes,type BuildFeedback as Report} from '../buildFeedback';
import './BuildFeedback.css';

const fields:{key:keyof Report;label:string;hint:string;required?:boolean}[]=[
 {key:'goal',label:'What were you trying to build?',hint:'A one-sentence goal and what a successful result would do.',required:true},
 {key:'context',label:'Where did you start?',hint:'Project or PR URL, commit, starter, engine/version, agent/model and relevant access gaps. No private machine paths.',required:true},
 {key:'skills',label:'What did you actually read and use?',hint:'Skill paths/versions, rules applied, assets/packages chosen. Say “none” or “unknown” when appropriate.'},
 {key:'worked',label:'What helped you succeed?',hint:'A useful brief, asset, skill, example or UI step.'},
 {key:'friction',label:'What should we review?',hint:'Expected versus actual, where you got stuck, steps to reproduce, or why the build went well. Include failed attempts.',required:true},
 {key:'improvement',label:'What would make the next build better?',hint:'A specific suggestion and how we could test it.'},
 {key:'evidence',label:'Evidence we can review',hint:'Sanitized screenshots, tests or repo-relative artifacts. No full session logs, tokens or private user data.'},
];
export default function BuildFeedback(){
 const [report,setReport]=useState<Report>(emptyFeedback);
 const [reviewed,setReviewed]=useState(false);
 const [notice,setNotice]=useState('');
 const [draft,setDraft]=useState('');
 function update(key:keyof Report,value:string){setReport(previous=>({...previous,[key]:value}));setDraft('');setReviewed(false);setNotice('');}
 function prepare(event:React.FormEvent){event.preventDefault();const error=feedbackError(report);if(error){setNotice(error);return;}setDraft(feedbackMarkdown(report));setNotice('Draft prepared. Review it below; nothing has been submitted.');}
 async function copy(){try{await navigator.clipboard.writeText(draft);setNotice('Copied. Paste into a repo issue or a sanitized report PR. Nothing submitted yet.');}catch{setNotice('Copy unavailable. Select the report text below.');}}
 const issueUrl=feedbackIssueUrl(report,draft);
 return <div className="build-feedback"><header><p className="create-kicker">BUILD → REFLECT → IMPROVE</p><h1>Help the next build hit harder.</h1><p>A blocked attempt is useful feedback. Tell us what happened so we can improve the tools, guidance and creator experience.</p></header>
 <aside><strong>One shared review inbox.</strong><p>Reports go to repository issues for human review. This page prepares a draft; it does not send logs, evaluate your session or save your answers. Copy your draft before leaving.</p><a href="https://github.com/marguerite347/ootle-lobby/issues?q=is%3Aissue+%22%5BBuild+experience%5D%22" target="_blank" rel="noreferrer">Browse build-experience reports ↗</a> · <Link to="/skills/learning-loop">How reviewed feedback becomes a lesson →</Link></aside>
 <form onSubmit={prepare}><div className="feedback-fields">{fields.map(field=><label key={field.key}>{field.label}{field.required?' *':''}<small>{field.hint}</small><textarea className="field" rows={field.key==='goal'?2:3} maxLength={2500} required={field.required} value={report[field.key]} onChange={event=>update(field.key,event.target.value)}/></label>)}</div>
 <label>How far did you get?<select className="field" value={report.outcome} onChange={event=>update('outcome',event.target.value)}>{feedbackOutcomes.map(outcome=><option key={outcome}>{outcome}</option>)}</select></label>
 <fieldset><legend>Optional measurements</legend><p>Leave unknown values blank. Include provider and credit units in the environment notes.</p><div className="feedback-metrics">{([['minutes','Minutes'],['corrections','Repeated corrections'],['wastedGenerations','Wasted generations'],['credits','Credits spent']] as const).map(([key,label])=><label key={key}>{label}<input className="field" type="number" min="0" step={key==='minutes'||key==='credits'?'any':'1'} value={report[key]} onChange={event=>update(key,event.target.value)}/></label>)}</div></fieldset>
 <button className="btn primary" type="submit">Prepare report for review →</button></form>
 <p role="status" aria-live="polite">{notice}</p>
 {draft&&<section className="feedback-review"><h2>Review what you’ll share.</h2><pre>{draft}</pre><label className="feedback-confirm"><input type="checkbox" checked={reviewed} onChange={event=>setReviewed(event.target.checked)}/> I reviewed this report and removed secrets, private logs and personal data.</label><div className="feedback-actions"><button className="btn" disabled={!reviewed} onClick={copy}>Copy Markdown report</button>{reviewed&&<a className="btn primary" href={issueUrl.length<7000?issueUrl:'https://github.com/marguerite347/ootle-lobby/issues/new?template=build-experience.md'} target="_blank" rel="noreferrer">Open GitHub submission ↗</a>}</div><p>{issueUrl.length>=7000?'This report is too long to prefill safely. Copy it, then paste it into the GitHub issue. ':''}GitHub access to this private repository is required. Submit there to create the review ticket; opening the page does not submit it. Without access, give the reviewed Markdown to your project maintainer.</p></section>}
 </div>;
}
