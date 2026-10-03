import {bundledSkills} from './bundledSkills.mjs';
import {skillCatalog} from './skills.mjs';

// Classify editorial metadata, not arbitrary text in downloaded instructions.
export const learningCategories = [
  {id:'game-design',label:'Game design',description:'Mechanics, player experience and better game loops.',pattern:/game.?design|mechanic|game.?feel|level.?design|narrative|dialogue|balanc|prototype|game.?jam|player/},
  {id:'engines',label:'Engines & development',description:'Unity, Unreal, Godot and games for the web.',pattern:/engine|unity|unreal|godot|gdevelop|playcanvas|phaser|three.?js|bevy|roblox|programming|rendering/},
  {id:'blueprints-verse',label:'Blueprints & Verse',description:'Visual scripting, Unreal gameplay and UEFN.',pattern:/blueprint|\bverse\b|uefn|fortnite|unreal/},
  {id:'assets',label:'Art & assets',description:'Build worlds with art, animation and VFX.',pattern:/asset|\bart\b|3d|2d|animat|vfx|shader|texture|modeling|modelling|sprite|graphic|material/},
  {id:'audio',label:'Audio & voice',description:'Sound design, music and expressive narration.',pattern:/audio|sound|music|voice|speech|tts/},
  {id:'marketing',label:'Capture & marketing',description:'Tell the story. Capture, edit and share your work.',pattern:/market|trailer|capture|video|cinema|remotion|promotion|publishing|monetiz/},
  {id:'agent-workflows',label:'AI & agent workflows',description:'Reusable skills, automation and creative AI tools.',pattern:/\bai\b|agent|workflow|hugging.?face|machine.?learning|llm|skill|automation/},
  {id:'tari-ootle',label:'Tari & Ootle',description:'Native templates, transactions and the Tari ecosystem.',pattern:/tari|ootle/},
  {id:'references',label:'More references',description:'Books, collections and other creative foundations.'},
];

export function categoriesFor(resource) {
  const text = [resource.title,resource.category,resource.ecosystem,...(resource.tags||[])].join(' ').toLowerCase();
  const matches = learningCategories.filter(c=>c.pattern?.test(text)).map(c=>c.id);
  return matches.length ? matches : ['references'];
}

export function learningSkills() {
  const native = skillCatalog().map(s=>({...s,native:true,description:s.description||s.summary,href:`/skills/${s.id}`}));
  return [...native,...bundledSkills.map(s=>({...s,href:`/skills?q=${encodeURIComponent(s.title)}`}))].map(s=>({
    id:`learning-skill:${s.native?'tari:':''}${s.id}`,type:'learn',learningKind:'skill',learningHref:s.href,
    title:s.title,summary:s.description||s.purpose||null,category:s.creatorId==='stanestane'?'Game design':null,tags:s.tags||[],
    ecosystem:s.native?'tari-ootle':'creative',native:!!s.native,format:'skill',level:null,
    lifecycle:s.lifecycle,sourceUrl:s.sourceUrl||null,creator:null,
    provenance:{sourceId:s.native?'tariskills':'repository-skills',sourceName:s.native?'TariSkills':'Repository skill library',freshness:'pinned'},
    verification:'unverified',
  }));
}
