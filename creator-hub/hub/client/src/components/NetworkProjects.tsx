import {useState} from 'react';
import {Link} from 'react-router-dom';
import resources from '../../../shared/ecosystemResources.json';
import september from '../../../data/contests/september-2026.json';
import status from '../../../../../content/network-status.json';
import {inNetwork, type NetworkEntry, type NetworkState} from '../../../shared/networkStatus.mjs';
import './NetworkProjects.css';

type CatalogItem={id?:string;slug?:string;title:string;cardSummary?:string;summary:string;type?:string;sourceUrl:string;discussionLinks?:{url:string}[];creator:string|{name:string};};
const community=import.meta.glob<CatalogItem>('../../../../../content/community-projects/*.json',{eager:true,import:'default'});
const submissions=import.meta.glob<CatalogItem>('../../../../../content/submissions/*/*.json',{eager:true,import:'default'});
const projectOverrides=import.meta.glob<Partial<CatalogItem>>('../../../../../content/projects/*.json',{eager:true,import:'default'});
const catalog=new Map<string,CatalogItem>(resources.records.map(record=>[record.id,record]));
for(const item of september.entries)catalog.set(item.id,item);
for(const item of Object.values(projectOverrides))if(item.id&&catalog.has(item.id))catalog.set(item.id,{...catalog.get(item.id)!,...item});
const resourceRefs=new Set(catalog.keys());
for(const item of Object.values(community))catalog.set(`community:${item.slug}`,item);
for(const [path,item] of Object.entries(submissions))catalog.set(`${path.split('/').at(-2)}:${item.slug}`,item);
const reviewedEntries=status.entries as NetworkEntry[];
type ProjectView='showcase'|Exclude<NetworkState,'both'>;
const labels:Record<ProjectView,string>={showcase:'Launch showcase',mainnet:'Mainnet',testnet:'Testnet',unconfirmed:'Not confirmed'};
const inView=(entry:NetworkEntry,view:ProjectView)=>view==='showcase'?Boolean(entry.showcase):inNetwork(entry,view);

export default function NetworkProjects({initialNetwork='showcase',entries=reviewedEntries}:{initialNetwork?:ProjectView;entries?:NetworkEntry[]}){
  const [network,setNetwork]=useState<ProjectView>(initialNetwork);
  const visible=entries.filter(entry=>inView(entry,network));
  const filters:ProjectView[]=[...(entries.some(entry=>entry.showcase)?['showcase' as const]:[]),'mainnet','testnet',...(entries.some(entry=>entry.state==='unconfirmed')?['unconfirmed' as const]:[])];
  return <section className="network-projects" id="mainnet" aria-labelledby="network-projects-title">
    <div className="network-projects-heading"><h2 id="network-projects-title">{network==='showcase'?<>Explore the <em>launch lineup.</em></>:<>On <em>{network==='mainnet'?'mainnet.':network==='testnet'?'testnet.':'the radar.'}</em></>}</h2><div className="network-filters" aria-label="Project network">{filters.map(value=><button key={value} type="button" aria-pressed={network===value} onClick={()=>setNetwork(value)}>{labels[value]} <span>{entries.filter(entry=>inView(entry,value)).length}</span></button>)}</div></div>
    {network==='showcase'&&<p className="network-showcase-intro">Wallets, payments, games and creative apps to explore for the Ootle launch. Check each card for its current network or demo mode.</p>}
    {!visible.length?<p className="network-empty">{network==='mainnet'?'Mainnet listings appear here once deployments are confirmed.':'No reviewed projects in this group yet.'} {network==='mainnet'&&entries.some(entry=>entry.showcase)&&<button type="button" onClick={()=>setNetwork('showcase')}>Explore the launch lineup</button>} {network==='mainnet'&&entries.some(entry=>inNetwork(entry,'testnet'))&&<button type="button" onClick={()=>setNetwork('testnet')}>Browse testnet tools</button>}</p>:<div className="network-project-grid">{visible.map(entry=>{
      const item=catalog.get(entry.ref);if(!item)return null;
      const showcase=network==='showcase'?entry.showcase:undefined;
      const href=showcase?.url||(network==='mainnet'?entry.mainnetUrl:entry.testnetUrl)||entry.evidenceUrl;
      const isCatalog=resourceRefs.has(entry.ref);
      const details=isCatalog?`/resource/${encodeURIComponent(entry.ref)}`:item.sourceUrl;
      const networkLabel=entry.state==='both'?'Mainnet + Testnet':entry.state==='testnet'?'Testnet only':labels[entry.state];
      return <article className="network-project" key={entry.ref}>
        <div className="network-project-status"><span>{showcase?.label||networkLabel}</span>{item.type==='learn'&&<span>Guide</span>}</div>
        <h3><a href={href} target="_blank" rel="noreferrer">{item.title}</a></h3>
        <p>{showcase?.summary||item.cardSummary||item.summary}</p>
        {network!=='mainnet'&&entry.mainnetPlan&&<p className="network-plan">{entry.mainnetPlan}</p>}
        <div className="network-project-links">{showcase&&<a className="network-project-open" href={href} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`}>Open app</a>}{isCatalog?<Link to={details}>Project details</Link>:<a href={details} target="_blank" rel="noreferrer">Original post</a>}{details!==entry.evidenceUrl&&href!==entry.evidenceUrl&&<a href={entry.evidenceUrl} target="_blank" rel="noreferrer">Network source</a>}</div>
        <small>{typeof item.creator==='string'?item.creator:item.creator.name} · Checked {new Date(entry.checkedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}</small>
      </article>;
    })}</div>}
  </section>;
}
