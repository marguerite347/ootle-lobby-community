import {safeHref} from '../../../shared/safeLinks.mjs';
import {useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import JournalArt from '../components/JournalArt';
import SubscribeForm from '../components/SubscribeForm';
import '../components/Journal.css';
type Article={slug:string;title:string;description:string;category:string;art:string;publishedAt:string;author:string;sections:[string,string][];sources:{label:string;url:string}[]};
export default function Blog(){
 const {slug}=useParams();const [origin,setOrigin]=useState('');const [calendar,setCalendar]=useState<{id:string;title:string;startDate:string;phase:string}[]>([]);const [articles,setArticles]=useState<Article[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(false);
 useEffect(()=>{fetch('/api/journal').then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{setArticles(data.articles);setOrigin(data.origin||'');setCalendar(data.calendar||[]);}).catch(()=>setError(true)).finally(()=>setLoading(false));},[]);
 const article=articles.find(item=>item.slug===slug);
 useEffect(()=>{
  const title=article?`${article.title} | Creator Journal`:'Creator Journal | Ootle Lobby';
  const description=article?.description||'Ideas and practical guides for building with Ootle Lobby.';
  document.title=title;
  const metadata=[['name','description',description],['property','og:title',title],['property','og:description',description],['property','og:type',article?'article':'website']];
  const nodes:Element[]=[];
  for(const [attribute,key,value] of metadata){const node=document.querySelector(`meta[${attribute}="${key}"]`)||document.head.appendChild(document.createElement('meta'));node.setAttribute(attribute,key);node.setAttribute('content',value);nodes.push(node);}
  document.querySelector('link[rel="canonical"]')?.remove();document.querySelector('meta[property="og:url"]')?.remove();document.querySelector('script[type="application/ld+json"]')?.remove();
  if(origin){const link=document.createElement('link');link.rel='canonical';link.href=origin+'/blog'+(article?'/'+article.slug:'');document.head.appendChild(link);nodes.push(link);}
  if(article){const schema=document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description,datePublished:article.publishedAt,author:{'@type':'Organization',name:article.author}});document.head.appendChild(schema);nodes.push(schema);}
  return()=>{document.title='Ootle Lobby';nodes.forEach(node=>node.remove());};
 },[article,origin]);
 if(loading)return <p role="status">Opening the journal…</p>;
 if(error)return <p role="alert">The journal could not load. Please refresh to try again.</p>;
 if(slug&&!article)return <section className="journal-page"><h1>Article not found.</h1><Link to="/blog">Back to the journal →</Link></section>;
 return <section className="journal-page">{article?<><Link className="more" to="/blog">← All stories</Link><header className="journal-article-heading"><span className="journal-kicker">{article.category}</span><h1>{article.title}</h1><p>{article.description}</p><small>{article.author} · <time dateTime={article.publishedAt}>{article.publishedAt}</time> · {Math.ceil(article.sections.reduce((sum,section)=>sum+section[1].split(' ').length,0)/200)} min read</small></header><JournalArt kind={article.art}/><article className="journal-body">{article.sections.map(([title,copy])=><section key={title}><h2>{title}</h2><p>{copy}</p></section>)}<aside className="journal-sources"><h2>Put it into practice</h2>{article.sources.map(source=><a key={source.url} href={safeHref(source.url)}>{source.label} ↗</a>)}</aside></article><div className="journal-related"><h2>Keep exploring</h2>{articles.filter(item=>item.slug!==slug).map(item=><Link key={item.slug} to={'/blog/'+item.slug}>{item.title} →</Link>)}</div></>:<><header className="journal-hero"><div><span className="journal-kicker">THE CREATOR JOURNAL</span><h1>Look what<br/><em>the lobby cooked.</em></h1></div><p>Build breakdowns, experiments and guides from Ootle Lobby. Find something worth trying.</p></header><div className="journal-grid">{articles.map((item,index)=><Link className={`journal-card ${index===0?'journal-featured':''}`} to={'/blog/'+item.slug} key={item.slug}><JournalArt kind={item.art}/><div className="journal-card-copy"><span className="journal-kicker">{item.category}</span><h2>{item.title}</h2><p>{item.description}</p><span className="journal-card-footer">{item.publishedAt}<b>Read the story ↗</b></span></div></Link>)}</div></>}{!article&&calendar.length>0&&<section className="journal-calendar"><div><span className="journal-kicker">FROM THE LIVE CHALLENGE CALENDAR</span><h2>Your next side quest.</h2></div>{calendar.map(edition=><Link key={edition.id} to="/challenges#calendar"><small>{edition.phase==='open'?'THIS WEEK':'COMING NEXT'} · {edition.startDate}</small><strong>{edition.title} ↗</strong></Link>)}</section>}<section className="journal-subscribe" id="subscribe"><div><span className="journal-kicker">GOOD STUFF. STRAIGHT TO YOUR INBOX.</span><h2>Keep up with<br/>the lobby.</h2><p>Build stories, Creator Jam briefs and useful finds from the lobby.</p><Link to="/challenges">Explore the challenge calendar →</Link></div><SubscribeForm/></section></section>;
}
