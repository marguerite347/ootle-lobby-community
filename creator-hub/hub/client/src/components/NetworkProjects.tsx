import {useState} from 'react';
import {Link} from 'react-router-dom';
import resources from '../../../shared/ecosystemResources.json';
import september from '../../../data/contests/september-2026.json';
import status from '../../../../../content/network-status.json';
import {inNetwork, type NetworkEntry, type NetworkState} from '../../../shared/networkStatus.mjs';
import './NetworkProjects.css';
import PublishedMainnetTemplates from './PublishedMainnetTemplates';

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
type ProjectView='showcase'|'watch'|Exclude<NetworkState,'both'>;
const labels:Record<ProjectView,string>={showcase:'All apps',mainnet:'Mainnet live',watch:'Mainnet watch',testnet:'Testnet',unconfirmed:'Not confirmed'};
const inView=(entry:NetworkEntry,view:ProjectView)=>view==='showcase'?Boolean(entry.showcase):view==='watch'?Boolean(entry.showcase)&&!inNetwork(entry,'mainnet'):inNetwork(entry,view);

export default function NetworkProjects({initialNetwork='showcase',entries=reviewedEntries}:{initialNetwork?:ProjectView;entries?:NetworkEntry[]}){
  const [network,setNetwork]=useState<ProjectView>(initialNetwork);
  const visible=entries.filter(entry=>inView(entry,network));
  const filters:ProjectView[]=[...(entries.some(entry=>entry.showcase)?['showcase' as const]:[]),'mainnet',...(entries.some(entry=>inView(entry,'watch'))?['watch' as const]:[]),'testnet'];
  const groups=network==='showcase'?[
    {id:'confirmed',title:'Mainnet live',description:'Apps and wallets available on Ootle mainnet. Each card describes what has been checked.',items:visible.filter(entry=>inNetwork(entry,'mainnet'))},
    {id:'watch',title:'Mainnet watch',description:'Apps to explore while mainnet verification is pending. Testnet, sandbox and unavailable features are labelled below.',items:visible.filter(entry=>!inNetwork(entry,'mainnet'))},
  ]:[{id:network,title:labels[network],description:network==='watch'?'Mainnet activity is not yet independently confirmed for these apps.':'',items:visible}];
  return <section className="network-projects" id="mainnet" aria-labelledby="network-projects-title">
    <div className="network-projects-heading"><h2 id="network-projects-title">Explore <em>Ootle apps.</em></h2><div className="network-filters" aria-label="Project network">{filters.map(value=><button key={value} type="button" aria-pressed={network===value} onClick={()=>setNetwork(value)}>{labels[value]} <span>{entries.filter(entry=>inView(entry,value)).length}</span></button>)}</div></div>
    <p className="network-showcase-intro">Explore apps, source projects and guides below. For Sapient, use the official store to get the latest available extension.</p>
    {groups.map(group=><section className="network-group" key={group.id} aria-labelledby={`network-${group.id}-title`}>
      <h3 id={`network-${group.id}-title`}>{group.title} <span>{group.items.length}</span></h3>
      {group.description&&<p className="network-group-description">{group.description}</p>}
      {!group.items.length?<p className="network-empty">{network==='mainnet'||group.id==='confirmed'?'Mainnet listings appear here once deployments are confirmed.':'No reviewed projects in this group yet.'}</p>:<div className="network-project-grid">{group.items.map(entry=>{
        const item=catalog.get(entry.ref);if(!item)return null;
        const showcase=entry.showcase;
        const href=network==='testnet'?entry.testnetUrl||entry.evidenceUrl:showcase?.url||entry.mainnetUrl||entry.testnetUrl||entry.evidenceUrl;
        const isCatalog=resourceRefs.has(entry.ref);
        const details=isCatalog?`/resource/${encodeURIComponent(entry.ref)}`:item.sourceUrl;
        const networkLabel=entry.state==='both'?'Mainnet + Testnet':entry.state==='testnet'?'Testnet only':labels[entry.state];
        const confirmed=inNetwork(entry,'mainnet')&&network!=='testnet';
        const evidenceUrl=confirmed?entry.deploymentEvidence?.url||entry.evidenceUrl:entry.evidenceUrl;
        const label=network==='testnet'?networkLabel:showcase?.label||networkLabel;
        return <article className="network-project" key={entry.ref}>
          <div className="network-project-status"><span>{label}</span>{item.type==='learn'&&<span>Guide</span>}</div>
          <h4><a href={href} target="_blank" rel="noreferrer">{item.title}</a></h4>
          <p>{network==='testnet'?item.cardSummary||item.summary:showcase?.summary||item.cardSummary||item.summary}</p>
          {!confirmed&&entry.mainnetPlan&&<p className="network-plan">{entry.mainnetPlan}</p>}
          <div className="network-project-links"><a className="network-project-open" href={href} target="_blank" rel="noreferrer" aria-label={`${entry.actionLabel||showcase?.actionLabel||'Open app'}: ${item.title}`}>{entry.actionLabel||showcase?.actionLabel||'Open app'}</a>{isCatalog?<Link to={details}>Project details</Link>:<a href={details} target="_blank" rel="noreferrer">Original post</a>}{evidenceUrl!==href&&<a href={evidenceUrl} target="_blank" rel="noreferrer">{confirmed?'Mainnet evidence':'Network source'}</a>}</div>
          <small>{typeof item.creator==='string'?item.creator:item.creator.name} · Checked {new Date(entry.checkedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}{showcase?.version&&` · ${showcase.version}`}</small>
        </article>;
      })}</div>}
    </section>)}
    {(network==='showcase'||network==='mainnet')&&<PublishedMainnetTemplates/>}
  </section>;
}
