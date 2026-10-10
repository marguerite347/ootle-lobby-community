import {requireLinkHost} from './safeLinks.mjs';
// Reviewed public records only. Runtime input cannot choose arbitrary metrics URLs.
export function validateCommunityProjects(items) {
  if (!Array.isArray(items) || items.length > 100) throw new Error('Expected up to 100 community projects.');
  const ids = new Set(), repos = new Set();
  const text = (v, max=1500) => {if(typeof v!=='string'||!v.trim()||v.length>max||/[<>\u0000-\u0008]/.test(v))throw new Error('Invalid project text.');};
  const keys = (v, allowed) => {if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!allowed.includes(k)))throw new Error('Unsupported community project fields.');};
  const url = (v,field='source') => {text(v);requireLinkHost(v,field);const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Public HTTPS URL required.');};
  const date = v => {if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(v)||!Number.isFinite(Date.parse(v)))throw new Error('Invalid source date.');};
  for(const p of items) {
    keys(p,['section','officialSource','resourceIds','demoUrl','slug','title','summary','cardSummary','cardStatus','creator','sourceUrl','sourceLabel','publishedAt','publicationBasis','publicationLabel','publicationUrl','repoUrl','forum','ecosystem','technologies','media']);
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||ids.has(p.slug))throw new Error('Invalid or duplicate community slug.');ids.add(p.slug);
    if(p.section!==undefined&&!['community','official'].includes(p.section))throw new Error('Invalid showcase section.');
    if(p.section==='official'){url(p.officialSource);if(!/^https:\/\/(?:www\.)?(?:tari\.com|ootle\.tari\.com)\//.test(p.officialSource)||!/^https:\/\/github\.com\/tari-project\//.test(p.repoUrl))throw new Error('Official projects require official site and repository evidence.');}
    if(p.demoUrl)url(p.demoUrl,'demo');
    if(p.resourceIds!==undefined&&(!Array.isArray(p.resourceIds)||p.resourceIds.length>20||p.resourceIds.some(id=>typeof id!=='string'||!/^tari(?:-ootle)?:[a-z-]+:[a-z0-9-]+$/.test(id))))throw new Error('Invalid catalog IDs.');
    text(p.title,100);if(p.cardSummary!==undefined)text(p.cardSummary,160);if(p.cardStatus!==undefined)text(p.cardStatus,80);text(p.summary);text(p.creator,80);text(p.sourceLabel,80);text(p.publicationBasis,300);text(p.publicationLabel,60);url(p.sourceUrl);url(p.publicationUrl);date(p.publishedAt);
    if(!['tari','tari-ootle'].includes(p.ecosystem))throw new Error('Invalid ecosystem.');
    if(p.repoUrl!==null){url(p.repoUrl,'repository');if(!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(p.repoUrl)||repos.has(p.repoUrl.toLowerCase()))throw new Error('Invalid or duplicate repository.');repos.add(p.repoUrl.toLowerCase());}
    if(p.forum!==null){keys(p.forum,['url','topicId','postNumber','scope']);url(p.forum.url);if(!Number.isInteger(p.forum.topicId)||p.forum.topicId<1||!Number.isInteger(p.forum.postNumber)||p.forum.postNumber<1||!['topic','replies'].includes(p.forum.scope)||!new RegExp(`^https://community\\.tari\\.com/t/(?:[a-z0-9-]+/)?${p.forum.topicId}(?:/${p.forum.postNumber})?/?$`).test(p.forum.url))throw new Error('Invalid forum source.');}
    if(!Array.isArray(p.technologies)||p.technologies.length>6)throw new Error('Invalid technologies.');
    for(const t of p.technologies){keys(t,['label','sourceUrl']);text(t.label,60);url(t.sourceUrl);}
    if(p.media!==null){keys(p.media,['image','video','label','sourceUrl','capturedAt','reviewedAt','sha256']);text(p.media.label,100);url(p.media.sourceUrl);date(p.media.capturedAt);date(p.media.reviewedAt);if(!/^\/previews\/community\/[a-z0-9-]+\.jpg$/.test(p.media.image)||!/^\/previews\/community\/[a-z0-9-]+\.mp4$/.test(p.media.video)||!/^[a-f0-9]{64}$/.test(p.media.sha256))throw new Error('Invalid reviewed media.');}
  }
  return items;
}
