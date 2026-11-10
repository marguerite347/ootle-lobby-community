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
const labels:Record<string,string>={mainnet:'Mainnet',testnet:'Testnet',unconfirmed:'Not confirmed'};

export default function NetworkProjects({initialNetwork='mainnet',entries=reviewedEntries}:{initialNetwork?:NetworkState;entries?:NetworkEntry[]}){
  const [network,setNetwork]=useState<NetworkState>(initialNetwork);
  const visible=entries.filter(entry=>inNetwork(entry,network));
  const filters=['mainnet','testnet',...(entries.some(entry=>entry.state==='unconfirmed')?['unconfirmed']:[])] as NetworkState[];
  return <section className="network-projects" id="mainnet" aria-labelledby="network-projects-title">
    <div className="network-projects-heading"><h2 id="network-projects-title">On <em>{network==='mainnet'?'mainnet.':network==='testnet'?'testnet.':'the radar.'}</em></h2><div className="network-filters" aria-label="Project network">{filters.map(value=><button key={value} type="button" aria-pressed={network===value} onClick={()=>setNetwork(value)}>{labels[value]} <span>{entries.filter(entry=>inNetwork(entry,value)).length}</span></button>)}</div></div>
    {!visible.length?<p className="network-empty">{network==='mainnet'?'Mainnet listings appear here once deployments are confirmed.':'No reviewed projects in this group yet.'} {network==='mainnet'&&entries.some(entry=>inNetwork(entry,'testnet'))&&<button type="button" onClick={()=>setNetwork('testnet')}>Browse testnet tools</button>}</p>:<div className="network-project-grid">{visible.map(entry=>{
      const item=catalog.get(entry.ref);if(!item)return null;
      const href=network==='mainnet'?entry.mainnetUrl:entry.testnetUrl;
      const isCatalog=resourceRefs.has(entry.ref);
      const details=isCatalog?`/resource/${encodeURIComponent(entry.ref)}`:item.sourceUrl;
      return <article className="network-project" key={entry.ref}>
        <div className="network-project-status"><span>{entry.state==='both'?'Mainnet + Testnet':entry.state==='testnet'?'Testnet only':labels[entry.state]}</span>{item.type==='learn'&&<span>Guide</span>}</div>
        <h3><a href={href||entry.evidenceUrl} target="_blank" rel="noreferrer">{item.title}</a></h3>
        <p>{item.cardSummary||item.summary}</p>
        {network!=='mainnet'&&entry.mainnetPlan&&<p className="network-plan">{entry.mainnetPlan}</p>}
        <div className="network-project-links">{isCatalog?<Link to={details}>Project details</Link>:<a href={details} target="_blank" rel="noreferrer">Original post</a>}{details!==entry.evidenceUrl&&href!==entry.evidenceUrl&&<a href={entry.evidenceUrl} target="_blank" rel="noreferrer">Network source</a>}</div>
        <small>{typeof item.creator==='string'?item.creator:item.creator.name} · Checked {new Date(entry.checkedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}</small>
      </article>;
    })}</div>}
  </section>;
}
