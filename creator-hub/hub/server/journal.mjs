import {safeHref} from '../shared/safeLinks.mjs';
import {readFileSync,readdirSync} from 'node:fs';
const blogDirectory = new URL('../content/blog/', import.meta.url);
export const launch = JSON.parse(readFileSync(new URL('../content/launch.json',import.meta.url),'utf8'));
export function publishedArticles(now = new Date()) {
  return readdirSync(blogDirectory).filter(name=>name.endsWith('.json')).map(name=>JSON.parse(readFileSync(new URL(name,blogDirectory),'utf8')))
    .filter(article=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) && article.status==='published' && article.reviewedAt && new Date(article.publishedAt)<=now)
    .sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||a.title.localeCompare(b.title));
}
export const escapeHtml = value => String(value).replace(/[&<>"']/g, character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
export function journalHtml(shell,article,origin='') {
  const title = article ? `${article.title} | Creator Journal` : 'Creator Journal | Tari games, challenges & workflows';
  const description = article?.description || 'Ideas, practical guides and community stories for building games, remixing projects and creating with Ootle Lobby.';
  const canonical = origin ? `${origin}/blog${article?'/'+article.slug:''}` : '';
  const metadata = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${article?'article':'website'}"><link rel="alternate" type="application/rss+xml" title="Creator Journal" href="/blog/feed.xml">${canonical?`<link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:url" content="${escapeHtml(canonical)}">`:''}`;
  const schema = article ? { '@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description,datePublished:article.publishedAt,dateModified:article.updatedAt,author:{'@type':'Organization',name:article.author},...(canonical?{mainEntityOfPage:canonical}:{})} : null;
  const body = article ? `<article><a href="/blog">Creator Journal</a><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.description)}</p>${article.sections.map(([heading,copy])=>`<h2>${escapeHtml(heading)}</h2><p>${escapeHtml(copy)}</p>`).join('')}<h2>Explore the sources</h2>${article.sources.map(source=>`<p><a href="${escapeHtml(safeHref(source.url)||'#')}">${escapeHtml(source.label)}</a></p>`).join('')}</article>` : `<h1>Creator Journal</h1>${publishedArticles().map(post=>`<article><h2><a href="/blog/${escapeHtml(encodeURIComponent(post.slug))}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p></article>`).join('')}`;
  return shell.replace(/<title>.*?<\/title>/,metadata+(schema?`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`:''))
    .replace('<div id="root"></div>',`<div id="root"><main>${body}</main></div>`);
}
export function journalFeed(origin) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Creator Journal</title><link>${escapeHtml(origin+'/blog')}</link><description>Ootle Lobby stories and practical guides.</description>${publishedArticles().map(article=>`<item><title>${escapeHtml(article.title)}</title><link>${escapeHtml(origin+'/blog/'+article.slug)}</link><guid>${escapeHtml(origin+'/blog/'+article.slug)}</guid><description>${escapeHtml(article.description)}</description><pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
}
