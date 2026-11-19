import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import resources from '../../../shared/ecosystemResources.json';
import september from '../../../data/contests/september-2026.json';
import status from '../../../../../content/network-status.json';
import {inNetwork, type NetworkEntry} from '../../../shared/networkStatus.mjs';
import './NetworkProjects.css';
import PublishedMainnetTemplates from './PublishedMainnetTemplates';
import {api} from '../api';
import {ResourceCardMedia, type CardMediaResource} from '../ui';
import CollapsibleProjects from './CollapsibleProjects';
import './ContestHologram.css';

type CatalogItem={preview?:CardMediaResource['preview'];media?:{image:string;video:string;label:string};recording?:{url:string;posterUrl:string;credit:string};id?:string;slug?:string;title:string;cardSummary?:string;summary:string;type?:string;sourceUrl:string;sourceLabel?:string;cardStatus?:string;discussionLinks?:{url:string}[];creator:string|{name:string};};
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
type ProjectView='mainnet'|'testnet';
const labels:Record<ProjectView,string>={mainnet:'Mainnet',testnet:'Testnet'};

export default function NetworkProjects({initialNetwork='mainnet',entries=reviewedEntries}:{initialNetwork?:ProjectView;entries?:NetworkEntry[]}){
  const [network,setNetwork]=useState<ProjectView>(initialNetwork);
  const [catalogPreviews,setCatalogPreviews]=useState<Record<string,CardMediaResource['preview']>>({});
  useEffect(()=>{
    let active=true;
    api.resources({q:'september-contest-2026'}).then(result=>{
      if(active)setCatalogPreviews(Object.fromEntries(result.items.map(item=>[item.id,item.preview])));
    }).catch(()=>{});
    return()=>{active=false;};
  },[]);
  const visible=entries.filter(entry=>inNetwork(entry,network));
  const filters:ProjectView[]=['mainnet','testnet'];
  return <section className="network-projects" id="mainnet" aria-labelledby="network-projects-title">
    <div className="network-projects-heading season-section-heading">
      <div><h2 id="network-projects-title">{network==='mainnet'?<>Live on <em>mainnet.</em></>:<>Explore <em>testnet.</em></>}</h2>
      <p>{network==='mainnet'?'Apps, wallets and tools built on Ootle.':'Try community builds on the Ootle testnet.'}</p></div>
      <div className="network-filters" aria-label="Project network">{filters.map(value=><button key={value} type="button" aria-pressed={network===value} onClick={()=>setNetwork(value)}>{labels[value]} <span>{entries.filter(entry=>inNetwork(entry,value)).length}</span></button>)}</div>
    </div>
    {!visible.length?<p className="network-empty">{network==='mainnet'?'Mainnet listings appear here once deployments are confirmed.':'No reviewed testnet projects yet.'}</p>:
    <CollapsibleProjects key={network} label={`${labels[network]} projects`}><div className="grid network-project-grid">{visible.map(entry=>{
        const item=catalog.get(entry.ref);if(!item)return null;
        const showcase=entry.showcase;
        const href=network==='testnet'?entry.testnetUrl||entry.evidenceUrl:showcase?.url||entry.mainnetUrl||entry.testnetUrl||entry.evidenceUrl;
        const isCatalog=resourceRefs.has(entry.ref);
        const details=isCatalog?`/resource/${encodeURIComponent(entry.ref)}`:item.sourceUrl;
        const networkLabel=entry.state==='both'?'Mainnet + Testnet':entry.state==='testnet'?'Testnet only':'Mainnet';
        const confirmed=inNetwork(entry,'mainnet')&&network!=='testnet';
        const evidenceUrl=confirmed?entry.deploymentEvidence?.url||entry.evidenceUrl:entry.evidenceUrl;
        const label=network==='testnet'?networkLabel:showcase?.label||networkLabel;
        const platformRestrictions=entry.ref.startsWith('community:')?item.cardStatus:undefined;
        const sourceLabel=item.sourceLabel==='Public repository'?'Source':'Original post';
        const preview=item.preview||catalogPreviews[entry.ref]||(item.media?{image:item.media.image,video:item.media.video,source:item.media.label}:item.recording?{image:item.recording.posterUrl,video:item.recording.url,source:item.recording.credit}:null);
        return <article className="network-project contest-hologram" key={entry.ref}>
          <div className="network-project-cover"><ResourceCardMedia r={{id:entry.ref,title:item.title,ecosystem:"tari-ootle",native:true,preview}} showControls showEcosystem={false}/></div>
          <div className="network-project-status"><span>{label}</span>{item.type==='learn'&&<span>Guide</span>}</div>
          {platformRestrictions&&<p className="network-platform">{platformRestrictions}</p>}
          <h3><a href={href} target="_blank" rel="noreferrer">{item.title}</a></h3>
          <p>{network==='testnet'?item.cardSummary||item.summary:showcase?.summary||item.cardSummary||item.summary}</p>
          {!confirmed&&entry.mainnetPlan&&<p className="network-plan">{entry.mainnetPlan}</p>}
          <div className="network-project-links"><a className="network-project-open" href={href} target="_blank" rel="noreferrer" aria-label={`${entry.actionLabel||showcase?.actionLabel||'Open app'}: ${item.title}`}>{entry.actionLabel||showcase?.actionLabel||'Open app'}</a>{isCatalog?<Link to={details}>Project details</Link>:<a href={details} target="_blank" rel="noreferrer">{sourceLabel}</a>}</div>
          <details className="network-project-evidence"><summary>Review notes</summary><p>{entry.evidence}</p>{preview?.source&&<p>Recording: {preview.source}</p>}<a href={evidenceUrl} target="_blank" rel="noreferrer">{confirmed?'Mainnet evidence':'Network source'}</a></details>
          <small>{typeof item.creator==='string'?item.creator:item.creator.name} · Checked {new Date(entry.checkedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}{showcase?.version&&` · ${showcase.version}`}</small>
        </article>;
      })}</div></CollapsibleProjects>}
    {network==='mainnet'&&<PublishedMainnetTemplates/>}
  </section>;
}
