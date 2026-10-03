import {makeResource} from '../model.mjs';
const references=[
 {id:'game-design-creative-ideas',name:'Stanislav Stankovic · Creative Ideas',url:'https://stanislav-stankovic.medium.com/ai-skills-for-game-design-creative-ideas-fbd58f81362f',title:'AI Skills for Game Design — Creative Ideas',summary:'An introduction to structured game-design ideation. Its linked skill repository is available as pinned downloads in the Skills library.',tags:['game-design','ideation','skills','workflow']},
 {id:'gamedev-reddit-reading',name:'r/gamedev · awesome repositories discussion',url:'https://www.reddit.com/r/gamedev/comments/5abuks/awesome_gamedev_repositories/',title:'Awesome gamedev repositories · historical discussion',summary:'Historical community discussion pointing to game-development resource lists and Awesome Game Talks. The linked talks repository is imported separately; the discussion is not a current activity signal.',tags:['game-design','talks','resources']},
];
export const designReadingConnectors=references.map(reference=>({
 source:{id:reference.id,name:reference.name,kind:'curated',native:false,canonicalUrl:reference.url,ingestion:'Linked reading reference reviewed 2026-09-23. Manual article review; its GitHub resources are tracked separately.'},
 async fetchLive(){return {records:[makeResource({id:`creative:learn:${reference.id}`,type:'learn',ecosystem:'creative',title:reference.title,summary:reference.summary,category:'Game design',tags:reference.tags,format:'article',sourceUrl:reference.url,docsUrl:reference.url,sourceId:reference.id,sourceName:reference.name,readiness:'conceptual',freshness:'provisional',verification:'source-attested',lastVerifiedAt:'2026-09-23'})]};}
}));
