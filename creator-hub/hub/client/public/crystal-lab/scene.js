import {mountCrystal} from './CrystalScene.js';
const params=new URLSearchParams(location.search);
const embedded=params.has('reward');
if(embedded)document.documentElement.classList.add('reward-embed');
const host=document.createElement('div');
Object.assign(host.style,{position:'fixed',inset:'0'});document.body.prepend(host);
let paused=params.has('still')||matchMedia('(prefers-reduced-motion: reduce)').matches,lighting=true;
const scene=mountCrystal(host,{query:params.toString(),onReady(){
  document.querySelector('#status').textContent='LIVE WEBGL · AI SPARK';
  document.querySelector('#charge').disabled=false;window.crystalReady=true;
  if(embedded)parent.postMessage('ootle-crystal-ready',location.origin);
},onError(error){document.querySelector('#status').textContent=error.message;}});
document.querySelector('#charge').onclick=()=>scene.charge();
document.querySelector('#motion').onclick=event=>{paused=!paused;scene.setPaused(paused);event.target.textContent=paused?'Resume motion':'Pause motion';};
document.querySelector('#lighting').onclick=event=>{lighting=!lighting;scene.setLighting(lighting);event.target.textContent=lighting?'Spark lighting: on':'Spark lighting: off';};
addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='ootle-wheel-light')scene.setEnergy(event.data.energy,Boolean(event.data.reduced));});
addEventListener('pagehide',event=>{if(!event.persisted)scene.dispose();});
