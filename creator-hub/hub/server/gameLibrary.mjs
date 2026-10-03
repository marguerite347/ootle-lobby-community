import {assetBucket} from './assets.mjs';
// A projection of the canonical catalog, never a second inventory.
export const GENRES = [
 { id: 'incremental', label: 'Idle & incremental', pattern: /idle|incremental|clicker|prestige/ },
 { id: 'cards', label: 'Cards & deckbuilders', pattern: /balatro|deckbuild|card game|solitaire/ },
 { id: 'platformer', label: 'Platformers & arcade', pattern: /platform|arcade|asteroid|runner|bomber|shark|road.crosser/ },
 { id: 'puzzle', label: 'Puzzles & trivia', pattern: /puzzle|trivia|guessing|sokoban|klots/ },
 { id: 'simulation', label: 'Simulation & crafting', pattern: /craft|farming|city|simulation|factory|techage/ },
 { id: 'racing', label: 'Racing & sports', pattern: /racing|car |vehicle|automobile|babyfoot|trackmania/ },
 { id: 'voxel', label: 'Voxel & sandbox', pattern: /voxel|luanti|sandbox/ },
 { id: 'action', label: 'Action & RPG', pattern: /rpg|role.play|shoot|first.person|dungeon|survival/ },
 { id: 'apps', label: 'Tari apps & economies', pattern: /tari-ootle/ },
 { id: 'tools', label: 'Engines, mods & systems', pattern: /framework|engine|component|mod|system|inventory/ },
];
export function gameLibrary(records) {
 const items = records.filter(r => !assetBucket(r)).filter(r => ['starter','component'].includes(r.type) || r.provenance?.sourceId === 'game-starters' || (r.ecosystem === 'playcanvas' && /engine|example/i.test(r.title))).map(r => {
  const text = [r.title, r.ecosystem, r.category, ...(r.tags || [])].join(' ').toLowerCase();
  const genres = GENRES.filter(g => g.pattern.test(text)).map(g => g.id);
  const kind = r.type === 'learn' ? 'reference' : /:mod:|\bmod\b/.test(text) && r.type === 'component' ? 'mod' : r.type === 'component' || /achievement system|inventory|admob|projectile|shape.based|animation.speed/.test(text) ? 'component' : (r.tags || []).includes('framework') ? 'framework' : 'starter';
  const engine = /godot|deckbuilder-framework|dark-forest/.test(text + ' ' + r.id) ? 'Godot' : /modding-tree/.test(r.id) ? 'Browser JavaScript' : /steamodded/.test(r.id) ? 'Balatro / Lua' : ({'tari-ootle':'Tari Ootle',gdevelop:'GDevelop',luanti:'Luanti',playcanvas:'PlayCanvas'}[r.ecosystem] || 'Cross-engine');
  return { ...r, genres: genres.length ? genres : ['tools'], kind, engine }; 
 });
 // Surface the newly curated foundations first, without hiding the native building blocks.
 items.sort((a,b) => Number(b.provenance?.sourceId === 'game-starters') - Number(a.provenance?.sourceId === 'game-starters') || a.title.localeCompare(b.title));
 return { items, genres: GENRES.map(({id,label}) => ({ id,label,count:items.filter(r=>r.genres.includes(id)).length })) };
}
