import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import './BudgetLeaderboard.css';

export type BudgetBuild={id:string;creatorId:string;creatorName:string;title:string;description:string;version:string;scope:string;demoUrl:string;category:string;stage:string;costs:{ai:number;assets:number;other:number};cashUsd:number;creditUsd:number|null;hours:number|null;revision:number;recommendations:number};
const money=(amount:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(amount);
export function rankBudgetBuilds(entries:BudgetBuild[],category:string,stage:string){
    const eligible=entries.filter(entry=>entry.category===category&&entry.stage===stage&&entry.recommendations>0&&Number.isFinite(entry.cashUsd)&&entry.cashUsd>=0);
    eligible.sort((a,b)=>a.cashUsd-b.cashUsd||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
    let rank=0,previous=-1;
    return eligible.map((entry,index)=>{if(entry.cashUsd!==previous)rank=index+1;previous=entry.cashUsd;return {...entry,rank};});
}
function identity(){try{return JSON.parse(localStorage.getItem('creator-profile')||'null') as {id:string;key:string}|null;}catch{return null;}}
async function request(route:string,body?:unknown){
    const owner=identity();
    const response=await fetch('/api/build-budgets'+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(body&&owner?{Authorization:`Bearer ${owner.key}`}:{})},...(body?{body:JSON.stringify({...body as object,creatorId:owner?.id})}:{})});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to save budget');return result;
}
export default function BudgetLeaderboard({onJoin}:{onJoin:()=>void}){
    const [entries,setEntries]=useState<BudgetBuild[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
    const [category,setCategory]=useState('game'),[stage,setStage]=useState('prototype'),[editing,setEditing]=useState<BudgetBuild|null>(null),[formOpen,setFormOpen]=useState(false),[busy,setBusy]=useState(false);
    const me=identity(),ranked=rankBudgetBuilds(entries,category,stage);
    const waiting=entries.filter(entry=>entry.category===category&&entry.stage===stage&&!entry.recommendations);
    async function refresh(){try{const result=await request('');setEntries(result.items);}catch(cause){setError((cause as Error).message);}finally{setLoading(false);}}
    useEffect(()=>{void refresh();},[]);
    async function action(route:string,body:object){setBusy(true);setError('');setNotice('');try{await request(route,body);await refresh();setNotice('Saved.');}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
    async function submit(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
        const optional=(key:string)=>data[key]===''?null:Number(data[key]);
        setBusy(true);setError('');setNotice('');
        try{await request('',{...data,costs:{ai:Number(data.ai),assets:Number(data.assets),other:Number(data.other)},creditUsd:optional('creditUsd'),hours:optional('hours'),shareConfirmed:data.shareConfirmed==='on',expectedRevision:editing?.revision});setFormOpen(false);setEditing(null);await refresh();setNotice('Budget shared. A recommendation from another creator makes it eligible to rank.');}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}
    }
    function card(entry:BudgetBuild,rank?:number){return <article className="budget-build" key={entry.id}>
        <div className="budget-price"><span>{rank?`#${rank}`:'AWAITING A RECOMMENDATION'}</span><strong>{money(entry.cashUsd)}</strong></div>
        <h3>{entry.title}</h3><Link to={`/creators/${entry.creatorId}`}>{entry.creatorName}</Link><p>{entry.description}</p>
        <div className="budget-facts"><span>Credits used: {entry.creditUsd===null?'Unknown':money(entry.creditUsd)}</span><span>Build time: {entry.hours===null?'Unknown':`${entry.hours}h`}</span></div>
        <small>Self-reported cash · {entry.recommendations} creator recommendation{entry.recommendations===1?'':'s'}</small>
        <p><a href={safeHref(entry.demoUrl)} target="_blank" rel="noreferrer">Try the build ↗</a></p>
        <details><summary>Cost breakdown & scope</summary><p>Version: {entry.version}</p><p>AI / compute: {money(entry.costs.ai)} · Assets: {money(entry.costs.assets)} · Other: {money(entry.costs.other)}</p><p>{entry.scope}</p></details>
        {me?.id===entry.creatorId?<div className="budget-actions"><button disabled={busy} onClick={()=>{setEditing(entry);setFormOpen(true);}}>Edit report</button><button disabled={busy} onClick={()=>void action(`/${entry.id}/withdraw`,{expectedRevision:entry.revision})}>Withdraw</button></div>:<form onSubmit={event=>{event.preventDefault();void action(`/${entry.id}/recommend`,{tested:true,expectedRevision:entry.revision});}}>
            <label className="budget-check"><input type="checkbox" required disabled={!me||busy}/> I tried this version and recommend it.</label><button disabled={!me||busy}>Recommend build</button>{!me&&<small>Create a creator profile to recommend.</small>}
        </form>}
    </article>;}
    return <div className="budget-board">
        <h3>Big impact.<br/><em>Small budget.</em></h3><p>Cool builds. Resourceful creators. Show what you made and what it cost.</p>
        <div className="budget-filters"><label>Build type<select value={category} onChange={event=>setCategory(event.target.value)}><option value="game">Games</option><option value="app">Apps</option><option value="media">Media</option></select></label><label>Stage<select value={stage} onChange={event=>setStage(event.target.value)}><option value="prototype">Prototype</option><option value="release">Release</option></select></label></div>
        <p className="budget-method">Recommended builds, lowest reported cash first. USD · credits and time shown separately.</p>
        {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
        <button className="arena-join" onClick={()=>{if(!me){onJoin();return;}setEditing(null);setFormOpen(!formOpen);}}>Share your build budget ↗</button>
        {formOpen&&<form key={editing?.id||'new'} className="budget-form" onSubmit={submit}>
            <h4>{editing?'Edit budget report':'What did you build?'}</h4>
            {(['title','demoUrl','version'] as const).map(field=><label key={field}>{({title:'Build title',demoUrl:'Working demo URL',version:'Build version / commit'})[field]}<input name={field} type={field==='demoUrl'?'url':'text'} required maxLength={field==='demoUrl'?2000:field==='title'?120:100} readOnly={field==='demoUrl'&&Boolean(editing)} defaultValue={editing?.[field]||''}/></label>)}
            <label>What makes it worth trying?<textarea name="description" required maxLength={600} defaultValue={editing?.description||''}/></label>
            <label>Build type<select name="category" defaultValue={editing?.category||category}><option value="game">Game</option><option value="app">App</option><option value="media">Media</option></select></label>
            <label>Stage<select name="stage" defaultValue={editing?.stage||stage}><option value="prototype">Prototype</option><option value="release">Release</option></select></label>
            <p>Cash spent through this version, in USD. Include failed generations and allocated subscription costs. Enter 0 only when known to be free; incomplete cash reports cannot rank.</p>
            {(['ai','assets','other'] as const).map(field=><label key={field}>{({ai:'AI / compute / allocated subscriptions ($)',assets:'Assets / licenses ($)',other:'Other cash costs ($)'})[field]}<input name={field} type="number" min="0" max="1000000" step=".01" required defaultValue={editing?.costs[field]??''}/></label>)}
            <label>Free or sponsored credits used ($, optional)<input name="creditUsd" type="number" min="0" max="1000000" step=".01" defaultValue={editing?.creditUsd??''}/></label>
            <label>Build time (hours, optional)<input name="hours" type="number" min="0" max="1000000" step=".01" defaultValue={editing?.hours??''}/></label>
            <label>Cost scope, reused work and exclusions<textarea name="scope" required maxLength={1500} defaultValue={editing?.scope||''} placeholder="What is included? How did you allocate subscriptions? Existing code, hardware, labor or donated work?"/></label>
            <label className="budget-check"><input name="shareConfirmed" type="checkbox" required/> Share this report publicly within this Hub. These are my reported costs, not independently verified.</label>
            {editing&&<p>Changes clear existing recommendations so creators can try the revised build.</p>}
            <button disabled={busy}>{busy?'Saving…':'Save budget report'}</button><button type="button" onClick={()=>setFormOpen(false)}>Cancel</button>
        </form>}
        {loading?<p>Loading build budgets…</p>:<>{ranked.length?ranked.slice(0,10).map(entry=>card(entry,entry.rank)):<p className="arena-state">No recommended builds in this category yet. Share a working demo and invite someone to try it.</p>}{waiting.length>0&&<details><summary>Awaiting recommendations ({waiting.length})</summary>{waiting.map(entry=>card(entry))}</details>}</>}
        <details className="arena-rules"><summary>How budget rankings work</summary><p>A working-demo link and complete cash breakdown are required. Another creator must attest they tried and recommend this version. Among eligible builds of the same type and stage, lower reported cash ranks higher; equal costs share a rank.</p><p>One recommendation per profile; no self-recommendations. This is a community signal, not verified quality, unique people or audited spend. Free credits and labor are separate from cash. Unknown values are not zero. No rewards or payouts are based on this board.</p><p>Hide portfolio or activity in your creator profile to leave the board. Edit a report to correct costs; recommendations reset. Withdraw removes the report.</p></details>
    </div>;
}
