import {createHash} from 'node:crypto';
import {getJson, githubHeaders} from './http.mjs';
import {makeResource} from '../model.mjs';

export const listDefinitions = [
  {repo:'ellisonleao/magictools'},
  {repo:'Calinou/awesome-gamedev'},
  {repo:'FronkonGames/Awesome-Gamedev'},
  {repo:'stevinz/awesome-game-engine-dev'},
  {repo:'BredaUniversityGames/programming-awesome-list'},
  {repo:'sindresorhus/awesome',section:'Gaming'},
  {repo:'Kavex/GameDev-Resources'},
  {repo:'hzoo/awesome-gametalks',files:['README.md','GDC.md']},
];
const clean = text => text.replace(/<[^>]*>/g,'').replace(/[*_`]/g,'').replace(/&amp;/g,'&').trim();
function safeUrl(value) {
  try {const url=new URL(value);return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;} catch {return null;}
}
export function classifyEntry(title, section) {
  const context=`${section} ${title}`.toLowerCase();
  if (/tutorial|learn|book|talk|lecture|article|course|postmortem|education|guide/.test(context)) return {type:'learn',format:/talk|video|youtube|lecture/.test(context)?'video':'reference'};
  if (/workflow|pipeline|production|marketing|organization|game jam|tools|version control|build systems|kickstarter|crowdfunding|document.*template/.test(context)) return {type:'learn',format:'reference',assetKind:'workflow'};
  if (/template engine/.test(context)) return {type:'component',format:'reference'};
  if (/\bstarter\b|\bboilerplate\b|\bproject template\b/.test(context)) return {type:'starter',format:'reference'};
  if (/asset|audio|music|sound|sprite|texture|font|art|graphic|model|animation/.test(context)) return {type:'asset',assetKind:'pack',format:'reference'};
  if (/engine|framework|librar|physics|rendering|network|programming|code/.test(context)) return {type:'component',format:'reference'};
  return {type:'learn',format:'reference'};
}

// Read list entries, not arbitrary prose/navigation. Resolve reference-style Markdown.
export function parseList(markdown, definition) {
  const references=new Map([...markdown.matchAll(/^\s*\[([^\]]+)\]:\s*<?(https?:\/\/[^\s>]+)>?/gm)].map(match=>[match[1].toLowerCase(),match[2]]));
  const headings=[]; const found=new Map();
  let scope=!definition.section;
  for(const line of markdown.split('\n')) {
    const heading=line.match(/^(#{1,6})\s+(.+)/);
    if(heading) {const level=heading[1].length;headings.length=level-1;headings[level-1]=clean(heading[2]).replace(/\s*#+$/,'');if(level===2&&definition.section)scope=headings[1]===definition.section;continue;}
    if(!scope || !/^\s*(?:[-*+]\s|\|)/.test(line))continue;
    const section=headings.slice(1).filter(Boolean).join(' / ') || 'Resources';
    if(/^(contents|table of contents|contribut|license|support|sponsor)/i.test(section))continue;
    const cells=line.trim().startsWith('|')?line.split('|'): [line];
    for(const cell of cells) {
      const match=cell.match(/(?<!!)\[([^\]]+)\](?:\(((?:[^\s()]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)|\[([^\]]+)\])/);
      if(!match)continue;
      const url=safeUrl(match[2] || references.get(match[3]?.toLowerCase()));
      if(!url)continue;
      let title=clean(match[1]);
      if(/^(link|youtube|video|website)$/i.test(title))title=clean(cell.slice(0,match.index)).replace(/[ (]+$/,'');
      if(!title || title.length<2 || /^(license|contributing|awesome|back to top)$/i.test(title))continue;
      const canonical=new URL(url);canonical.hash='';
      const key=canonical.href.replace(/^http:/,'https:').replace('://www.', '://').replace(/\/$/,'');
      if(!found.has(key))found.set(key,{title:title.slice(0,180),url,section,key,...classifyEntry(title,section)});
    }
  }
  return [...found.values()];
}

export const gameResourceConnectors=listDefinitions.map(definition => {
  const source={id:`game-list:${definition.repo.toLowerCase()}`,name:definition.repo,kind:'github-list',canonicalUrl:`https://github.com/${definition.repo}`,
    native:false,ingestion:`Imports categorized ${definition.section ? definition.section+' section' : 'list'} entries hourly while the Hub runs. List membership is not endpoint, compatibility or license verification.`};
  return {source,async fetchLive() {
    const files=definition.files || [null];const records=[];
    for(const file of files) {
      const document=await getJson(`https://api.github.com/repos/${definition.repo}/${file?'contents/'+file:'readme'}`,{headers:githubHeaders()});
      if(document.encoding!=='base64'||!document.sha||typeof document.content!=='string')throw Error('Missing GitHub document content');
      const markdown=Buffer.from(document.content,'base64').toString('utf8');
      const entries=parseList(markdown,definition);
      if(!entries.length)throw Error('No list entries parsed; retaining previous import');
      for(const entry of entries) records.push(makeResource({
        id:`game-list-resource:${createHash('sha256').update(entry.key).digest('hex').slice(0,24)}`,
        ...entry,ecosystem:'creative',category:entry.section,title:entry.title,
        summary:`Listed under ${entry.section} in ${definition.repo}. Open the original resource for details; execution and compatibility have not been checked.`,
        sourceUrl:entry.url,docsUrl:entry.url,repoUrl:/^https:\/\/github.com\//.test(entry.url)?entry.url:null,
        tags:['game-resource-lists',definition.repo,entry.section,entry.assetKind==='workflow'?'workflow':entry.type],
        readiness:'conceptual',verification:'source-attested',sourceId:source.id,sourceName:source.name,
        upstreamRevision:document.sha,upstreamId:entry.key,attribution:`Discovered in ${source.canonicalUrl}; original resource authors retain attribution.`,
        relationships:[{type:'listed-in',url:document.html_url || source.canonicalUrl,title:source.name}],
      }));
    }
    return {records};
  }};
});
