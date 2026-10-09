import {mountCrystal} from '../crystal-lab/CrystalScene.js';
import {createCharge} from './charge.js';
import {selectAlphaVideoSource} from './alpha-video.mjs';
import {createWedgeFinish} from './wedge-finish.js';
import {superWedges, superOutcomes, superLanding} from './super-disc.js';
import {crystalPalettes} from '../crystal-lab/palettes.js';
import { Application } from './vendor/runtime.js';
import {wheelRuntimeOptions} from './runtime-options.mjs';
import * as THREE from 'three';
import { RoomEnvironment } from '../crystal-lab/vendor/environments/RoomEnvironment.js';
// Isolated visual fixture: no account, reward endpoint or settlement.
const captureParams=new URLSearchParams(location.search);
const embedded=captureParams.has('embed');
const chargeTrial=captureParams.has('charge') || embedded;
const charge=chargeTrial ? createCharge(document.querySelector('#stage'), {embedded}) : null;
document.body.classList.toggle('charge-trial',chargeTrial);
document.body.classList.toggle('charge-compare',chargeTrial && captureParams.has('compare'));
if(embedded) { document.body.classList.add('embedded','awaiting-first-spin'); document.querySelector('#spin').textContent='SPIN IT!'; }
const superPreview=captureParams.has('super');
let superActive=false, superDisc, superDeclined=false, superTransitioning=false;
let autoActive=false, autoSpinTimer;
function queueAutoSpin() {
  clearTimeout(autoSpinTimer);
  if(!embedded || !autoActive || document.documentElement.dataset.ready!=='true' || spin || superTransitioning || document.body.classList.contains('won')) return;
  autoSpinTimer=setTimeout(()=>{
    if(autoActive && !$('#spin').disabled && !$('#spin').hidden) $('#spin').click();
  },900);
}
const nextRenderFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
const demoBase=captureParams.get('base')==='150'?150:100;
if(captureParams.has('film')) document.body.classList.add('film');
const MULTIPLIERS = [1,2,1,3,2,5,1,2,1,3,2,5];
const $ = selector => document.querySelector(selector);
$('.bank strong').innerHTML=`${demoBase} <small>AI Sparks</small>`;
const canvas = document.createElement('canvas');
$('#stage').append(canvas);
canvas.style.pointerEvents = 'none';
if(superPreview) canvas.style.visibility='hidden';
const app = new Application(canvas, wheelRuntimeOptions(import.meta.url));
let wheel, peg, spin, selected = 11;
const panels=[], bevels=[], panelGroups=Array.from({length:12},()=>[]);
const baseLabels=[],superLabels=[];
let environment, movingLight, settledAt=-10000;
let crystalScene;
let superCountUp=null, wedgeFinish, updatePointerOcclusion;
function makeStudioReflections() {
  const renderer=new THREE.WebGLRenderer({antialias:false});
  const room=new RoomEnvironment();
  const target=new THREE.WebGLCubeRenderTarget(128);
  new THREE.CubeCamera(.1,100,target).update(renderer,room);
  const faces=[];
  for(let face=0;face<6;face++) {
    const pixels=new Uint8Array(128*128*4);
    renderer.readRenderTargetPixels(target,0,0,128,128,pixels,face);
    const image=document.createElement('canvas'); image.width=image.height=128;
    image.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels),128,128),0,0);
    faces.push(image);
  }
  target.dispose(); room.dispose(); renderer.dispose(); return faces;
}
function physical(three, options) {
  return new three.MeshPhysicalNodeMaterial({envMap:environment,envMapIntensity:1.6,clearcoat:1,clearcoatRoughness:.06,...options});
}
function labelCanvas(value,jackpot) {
  const image=document.createElement('canvas');image.width=512;image.height=320;
  const context=image.getContext('2d');context.font='800 180px OotleDisplay';
  context.textAlign='center';context.textBaseline='middle';context.lineJoin='round';
  const text=`${value}×`;
  context.strokeStyle='#18082b';context.lineWidth=24;
  context.strokeText(text,256,160);
  context.fillStyle='#291040';context.fillText(text,260,172);
  const fill=context.createLinearGradient(0,70,0,225);fill.addColorStop(0,'#ffffff');fill.addColorStop(.48,jackpot?'#fffed9':'#f6eaff');fill.addColorStop(1,jackpot?'#e4fa4a':'#b482f0');
  context.fillStyle=fill;context.fillText(text,256,155);return image;
}
let chosenPalette=crystalPalettes.find(palette=>palette.id===captureParams.get('palette')) || crystalPalettes[Math.floor(Math.random()*crystalPalettes.length)];
for(const palette of crystalPalettes) {
 const button=document.createElement('button');button.type='button';button.className='color-choice';button.textContent=palette.name;button.setAttribute('aria-pressed',String(palette===chosenPalette));
 button.title=`Edges ${palette.edge} · Facets ${palette.facet} · Core ${palette.core}`;
 button.style.setProperty('--edge',palette.edge);button.style.setProperty('--shell',palette.facet);button.style.setProperty('--core',palette.core);
 button.onclick=()=>{chosenPalette=palette;for(const item of $('#palettes').children)item.setAttribute('aria-pressed',String(item===button));reloadCrystal().catch(error=>console.error(error));};
 $('#palettes').append(button);
}
$('#energy').addEventListener('change',()=>{reloadCrystal().catch(error=>console.error(error));});
const reduced = $('#reduced');
reduced.checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
function copy(phase, reward, detail) {
  $('#win-unit').hidden=true;
  if(embedded) detail=detail.replace(/ · Demo only.*| Demo only\.| Scripted demo\.|Scripted visual proof · No credits awarded\./g,'').replace(/Demo only, no balance changed\./g,'Your haul. Locked in.');
  const changed = $('#phase').textContent !== phase;
  for(const [id,text] of [['phase',phase],['reward',reward],['detail',detail]]) {
    const node=$('#'+id);if(node.textContent!==text)node.textContent=text;
  }
  if(changed) { $('#reward').classList.remove('reward-type'); void $('#reward').offsetWidth; $('#reward').classList.add('reward-type'); }
}
function winCopy(headline, total) {
 copy(headline,total.toLocaleString('en-US'),'');
 $('#win-unit').hidden=false;
}
const sparkSlots=[];
let sparkCursor=0,lastSpark=0,lastSignal=0;
function createPointerOcclusion() {
  const namespace='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(namespace,'svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');
  svg.innerHTML='<defs><mask id="peg-occlusion" maskUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="white"/><path fill="black"/></mask></defs>';
  $('#stage').append(svg);
  const mask=svg.querySelector('mask'),path=svg.querySelector('path');
  $('.grinder-layer').style.mask='url(#peg-occlusion)';
  return ()=>{
    const bounds=$('#stage').getBoundingClientRect();
    const radius=embedded?(bounds.height<400?123:148):bounds.height*.336;
    const x=bounds.width/2-radius*.01,y=bounds.height/2-radius*1.005;
    const halfWidth=radius*.09,halfHeight=radius*.163;
    mask.setAttribute('width',String(bounds.width));mask.setAttribute('height',String(bounds.height));
    svg.querySelector('rect').setAttribute('width',String(bounds.width));
    svg.querySelector('rect').setAttribute('height',String(bounds.height));
    // Rounded crown, broad shoulders, tapered tip, moving with the peg tick.
    path.setAttribute('d',`M 0 ${-halfHeight} C ${halfWidth} ${-halfHeight}, ${halfWidth*1.15} ${-halfHeight*.25}, ${halfWidth*.83} ${halfHeight*.28} C ${halfWidth*.55} ${halfHeight*.8}, ${halfWidth*.22} ${halfHeight}, 0 ${halfHeight} C ${-halfWidth*.22} ${halfHeight}, ${-halfWidth*.55} ${halfHeight*.8}, ${-halfWidth*.83} ${halfHeight*.28} C ${-halfWidth*1.15} ${-halfHeight*.25}, ${-halfWidth} ${-halfHeight}, 0 ${-halfHeight} Z`);
    path.setAttribute('transform',`translate(${x} ${y}) rotate(${-peg.rotation.z*180/Math.PI})`);
  };
}
function addSparks() {
  // Occlude the video pass at the Spline peg so sparks sit between peg and disc.
  const layer=document.createElement('div');
  layer.className='grinder-layer'; layer.setAttribute('aria-hidden','true');
  $('#stage').append(layer);
  const probe=document.createElement('video');
  const source=selectAlphaVideoSource({userAgent:navigator.userAgent,canPlayType:type=>probe.canPlayType(type)},
    {webm:'./grinder-sparks-alpha.webm',hevc:'./grinder-sparks-alpha.mov'});
  // An unavailable decorative codec must never obscure or block the wheel.
  if(!source) return;
  for(let index=0;index<(chargeTrial?6:4);index++) {
    const video=document.createElement('video');
    video.className='grinder-trail'; video.src=source;
    video.muted=true; video.playsInline=true; video.preload='auto'; video.hidden=true;
    layer.append(video);
    // The licensed clip is keyed to real alpha offline. Do not rely on
    // additive blending across a transparent iframe to remove black.
    sparkSlots.push({video,at:-10000,duration:0});
  }
}
function burst(now,impact=false,intensity=1) {
  if(reduced.checked || !$('#effects').checked) return;
  const slot=sparkSlots[sparkCursor++%sparkSlots.length];if(!slot)return;
  slot.at=now;slot.duration=impact?1100:(chargeTrial?780:500);
  slot.video.style.setProperty('--spark-strength',String(impact?1.6:1+ .6*intensity));
  slot.video.style.setProperty('--spark-scale',String(impact?1.18:.85+.25*intensity));
  slot.video.hidden=true;slot.video.currentTime=.033;slot.video.playbackRate=impact?.85:(chargeTrial?.8:1);
  slot.video.style.opacity='1';
  slot.video.play().then(()=>{
    slot.video.hidden=reduced.checked || !$('#effects').checked || performance.now()-slot.at>slot.duration;
  }).catch(()=>{slot.video.hidden=true;});lastSpark=now;
}
async function start() {
  for(const control of document.querySelectorAll('#palettes button,#energy'))control.disabled=true;
  const response=await fetch('./scene.splinecode');
  if(!response.ok) throw new Error(`Spline scene returned ${response.status}`);
  await app.start(await response.arrayBuffer(),{interactive:false});
  app.setBackgroundColor(embedded || chargeTrial ? 'rgba(0,0,0,0)' : '#08071c');
  environment=new THREE.CubeTexture(makeStudioReflections()); environment.needsUpdate=true;
  const face=new FontFace('OotleDisplay','url(./poppins-800.woff2)',{weight:'800'}); await face.load(); document.fonts.add(face);
  const objects=app.getAllObjects();
  const whole=app.findObjectByName('Whole');
  whole.position.y=0; whole.rotation.y=0.14;
  wheel=app.findObjectByName('main wheel'); peg=app.findObjectByName('Peg');
  for(const name of ['Btn','popup','Central disc','Movement objects','Segment TEMPLATE']) app.findObjectByName(name)?.hide();
  let cloneIndex=-1;
  for(const object of objects) {
    const match=/^Clone (\d+)$/.exec(object.name);
    if(match) cloneIndex=Number(match[1]);
    if(object.name==='segment' && cloneIndex>=0 && cloneIndex<12) {
      const material=await app.setMaterial(object, three=>physical(three,{color:MULTIPLIERS[cloneIndex]===5 ? '#c8f112' : cloneIndex%2 ? '#8c40ce' : '#36125e',metalness:.48,roughness:.14}));
      panels.push(material);panelGroups[cloneIndex].push(material);
    }
    if(object.name==='dark') {
      const material=await app.setMaterial(object, three=>physical(three,{color:'#563487',metalness:.85,roughness:.12}));
      if(cloneIndex>=0 && cloneIndex<12) bevels.push(material);
    }
    if(object.name==='top' || object.name==='Ellipse 4') await app.setMaterial(object, three=>physical(three,{color:'#d6fa32',metalness:.55,roughness:.13}));
    if(object.name==='Text' && cloneIndex>=0 && cloneIndex<12) object.hide();
  }
  for(let index=0;index<12;index++) {
    const image=labelCanvas(MULTIPLIERS[index],MULTIPLIERS[index]===5);
    const label=await app.createObject('Plane',{name:`Ootle multiplier ${index}`,parent:app.findObjectByName(`Clone ${index}`),
      width:108,height:68,position:[-57,216,-10],rotation:[0,0,18.11],
      material:three=>{const texture=new THREE.CanvasTexture(image);return new three.MeshBasicNodeMaterial({map:texture,transparent:true,depthWrite:false});}});
    baseLabels.push(label);
    if(superPreview){
      const factor=superWedges[index],image=labelCanvas(factor,factor>1);
      const superLabel=await app.createObject('Plane',{name:`Ootle Super multiplier ${index}`,parent:app.findObjectByName(`Clone ${index}`),
        width:108,height:68,position:[-57,216,-10],rotation:[0,0,18.11],
        material:three=>new three.MeshBasicNodeMaterial({map:new THREE.CanvasTexture(image),transparent:true,depthWrite:false})});
      superLabel.hide();superLabels.push(superLabel);
    }
  }
  if(superPreview) {
    superDisc={
      show(){
        baseLabels.forEach(label=>label.hide());superLabels.forEach(label=>label.show());
        panelGroups.forEach((group,index)=>group.forEach(material=>{material.emissiveIntensity=0;material.color.set(superWedges[index]>1?['#813bf5','#ff3cba','#59f5ff','#c9eb00'][index/3]:index%2?'#170c29':'#09051c');}));
      },
      hide(){
        superLabels.forEach(label=>label.hide());baseLabels.forEach(label=>label.show());
        panelGroups.forEach((group,index)=>group.forEach(material=>material.color.set(MULTIPLIERS[index]===5?'#c8f112':index%2?'#8c40ce':'#36125e')));
      }
    };
    superDisc.hide();
    $('#target').value='11';
    $('#super-offer').hidden=false;
    $('#super-offer').textContent='Land 5× to unlock the second wheel.';
  }
  wedgeFinish=createWedgeFinish(panels,bevels,()=>{});
  const crystalHost=document.createElement('div');crystalHost.id='crystal-hub';$('#stage').append(crystalHost);
  const crystalReady=reloadCrystal();
  crystalReady.catch(()=>{});
  addSparks();
  updatePointerOcclusion=createPointerOcclusion();
  await app.createObject('DirectionalLight',{name:'Ootle key light',position:[-200,350,500],intensity:0.55,color:'#fff0ff'});
  await app.createObject('DirectionalLight',{name:'Ootle rim light',position:[300,100,250],intensity:0.3,color:'#bd8aff'});
  movingLight=await app.createObject('PointLight',{name:'Spark contact light',position:[0,290,180],color:'#eaff9b',intensity:0,distance:1200,decay:1});
  // Warm the Super texture/material before the first visible spin, not at its reveal.
  if(superPreview) {
    superDisc.show();
    for(let frame=0;frame<4;frame++) await nextRenderFrame();
    superDisc.hide();
    await nextRenderFrame();
  }
  await crystalReady;
  for(const control of document.querySelectorAll('#palettes button,#energy'))control.disabled=false;
  await nextRenderFrame();
  canvas.style.visibility='visible';
  $('#loading').hidden=true; $('#spin').disabled=false;
  copy('FIRST SPIN','Boost your haul.',`${demoBase} AI Sparks locked. Up to ${(demoBase*5).toLocaleString()}. Demo only.`);
  if(chargeTrial && superPreview && captureParams.has('chargeSuper')) await showSuper();
  document.documentElement.dataset.ready='true';
  if(embedded) parent.postMessage({type:'ootle-wheel-ready'},location.origin);
}
function finish() {
  if(!spin) return;
  wheel.rotation.z=spin.to; peg.rotation.z=0; spin=null; settledAt=performance.now();burst(settledAt,true);
  if(superActive) { finishSuper(); return; }
  const multiplier=MULTIPLIERS[selected];
  panelGroups[selected]?.forEach(material=>{material.emissive.set('#d2f51b');material.emissiveIntensity=.23;});
  winCopy(({1:'HAUL SECURED.',2:'DOUBLE UP!',3:'STACKED!',5:'BIG SPARK ENERGY!'})[multiplier],demoBase*multiplier);
  document.body.classList.add('won'); $('#spin').disabled=false; $('#spin').textContent='Spin again ↗'; $('#skip').hidden=true;
  document.documentElement.dataset.result=String(multiplier);
  notifySettled();
  if(multiplier>1) playSparkBurst();
  if(superPreview && multiplier===5) {
    $('#spin').hidden=true; $('#continue-super').hidden=embedded; $('#decline-super').hidden=embedded;
    $('#super-offer').textContent=embedded ? `${demoBase*5} AI Sparks banked. Super is up next…` : `${demoBase*5} AI Sparks banked. Super is optional. Your haul stays yours.`;
    if(embedded) setTimeout(showSuper, reduced.checked ? 1800 : 4400);
  }
}
$('#spin').addEventListener('click',()=>{
  document.body.classList.remove('awaiting-first-spin');
  if(superActive) { startSuper(); return; }
  for(const material of panels) material.emissiveIntensity=0;
  selected=Number($('#target').value);
  const current=wheel.rotation.z, target=selected*Math.PI/6-Math.PI/60;
  const remainder=((current-target)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  wheelCue('spin'); lastAudioWedge=null;
  spin={started:performance.now(),from:current,to:current-10*Math.PI-remainder};
  document.body.classList.remove('won'); $('#spin').disabled=true; $('#spin').textContent='Spinning…'; $('#skip').hidden=false;
  copy('LOCKED IN','Charging up…',`${demoBase} AI Sparks on the wheel.`);
  if(reduced.checked) finish();
});
$('#skip').addEventListener('click',finish);

async function showSuper() {
  if(spin || superActive || superDeclined || superTransitioning) return;
  superTransitioning=true;
  $('#spin').disabled=true;
  if(!reduced.checked) await canvas.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards',easing:'ease-in'}).finished;
  superActive=true;
  // Reuse the actual beveled Spline wedges; swap only labels and materials.
  superDisc.show(); wheel.rotation.z=0;
  document.body.classList.remove('won'); document.body.classList.add('super-active','super-ready');
  $('.eyebrow').textContent='5× HIT. SUPER UNLOCKED.';
  $('h1').innerHTML='Turn it<br><em>way up.</em>';
  $('.description').textContent='Your haul is banked. One more shot at a bigger stack.';
  $('.bank>span').textContent='ALREADY BANKED · DEMO';
  $('.bank strong').innerHTML=`${demoBase*5} <small>AI Sparks</small>`;
  $('#continue-super').hidden=true; $('#decline-super').hidden=embedded;
  $('#spin').hidden=false; $('#spin').textContent=embedded ? 'Spin It MORE!!' : 'Take the Super Spin ↗';
  $('#super-odds').hidden=false;
  $('#target').innerHTML=superOutcomes.map((row,index)=>`<option value="${index}">${row.factor}× banked · ${row.percent.toFixed(2)}%</option>`).join('');
  $('#target').value='4';
  $('#super-offer').textContent='Multiplies your banked haul. 1× keeps it.';
  $('#super-odds').innerHTML=superOutcomes.map(row=>`<li><b>${row.factor}×</b>${row.percent.toFixed(2)}%</li>`).join('');
  copy('SUPER SPIN UNLOCKED','GO SUPER.',`${(demoBase*5).toLocaleString()} locked. Chase ${(demoBase*100).toLocaleString()} AI Sparks. Demo only.`);
  document.documentElement.dataset.wheel='super';
  await nextRenderFrame();
  await nextRenderFrame();
  if(!reduced.checked) await canvas.animate([{opacity:0},{opacity:1}],{duration:280,fill:'forwards',easing:'ease-out'}).finished;
  canvas.getAnimations().forEach(animation=>animation.cancel());
  $('#spin').disabled=false;
  superTransitioning=false;
  wheelCue('unlock');
  if(!embedded) $('#spin').focus();
  queueAutoSpin();
}
function startSuper() {
  if(spin || superDeclined) return;
  document.body.classList.remove('super-ready');
  superCountUp=null;
  selected=Number($('#target').value);
  const current=wheel.rotation.z, target=superLanding(selected);
  const remainder=((current-target)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  wheelCue('superSpin'); lastAudioWedge=null;
  spin={started:performance.now(),from:current,to:current-20*Math.PI-remainder};
  document.body.classList.remove('won','super-jackpot');
  $('#spin').disabled=true; $('#spin').textContent='Spinning…'; $('#skip').hidden=false; $('#decline-super').hidden=true;
  copy('LOCKED IN','Charging up…',`${demoBase*5} is already banked. Scripted demo.`);
  if(reduced.checked) finish();
}
function finishSuper() {
  const row=superOutcomes[selected], total=demoBase*row.total;
  if(!reduced.checked && total>demoBase*5) superCountUp={started:performance.now(),from:demoBase*5,to:total,multiplier:row.total};
  winCopy(row.total===100?'ABSOLUTELY SUPERCHARGED!':row.total===5?'HAUL SECURED.':'STACKED HIGHER!',total);
  document.body.classList.add('won');
  document.body.classList.toggle('super-jackpot',row.total===100 && $('#effects').checked && !reduced.checked);
  $('#spin').disabled=false; $('#spin').hidden=embedded; $('#spin').textContent='Replay Super demo ↗'; $('#skip').hidden=true;
  $('#super-offer').textContent=embedded?'Your haul is locked in. Come back for the next drop.':'Visual proof complete. No account or balance was changed.';
  document.documentElement.dataset.result=String(row.total);
  notifySettled();
  playSparkBurst();
}
$('#continue-super').addEventListener('click',showSuper);
$('#decline-super').addEventListener('click',()=>{
  superDeclined=true;
  $('#continue-super').hidden=true; $('#decline-super').hidden=true; $('#spin').hidden=true;
  copy('YOUR HAUL. LOCKED IN.',`${demoBase*5} AI Sparks`, 'Super skipped. Your banked reward stays yours. Demo only.');
  $('#super-offer').textContent=embedded?'Your haul is locked in. Come back for the next drop.':'Refresh this isolated proof to try the sequence again.';
  notifySettled();
});

let lastAudioWedge = null, lastClackAt = 0;
function wheelCue(cue) {if (embedded) parent.postMessage({type:'ootle-wheel-audio', cue}, location.origin);}
function frame(now) {
  charge?.paint({now,elapsed:spin?(now-spin.started)/1000:null,rotation:wheel?.rotation.z||0,superActive,disabled:reduced.checked || !$('#effects').checked});
  updatePointerOcclusion?.();
  wedgeFinish?.paint(now,superActive,reduced.checked,$('#effects').checked);
  if(superCountUp) {
    const progress=reduced.checked?1:Math.min(1,(now-superCountUp.started)/1100);
    const amount=Math.round(superCountUp.from+(superCountUp.to-superCountUp.from)*(1-Math.pow(1-progress,3)));
    $('#reward').textContent=amount.toLocaleString('en-US');
    if(progress===1) superCountUp=null;
  }
  for(const slot of sparkSlots) {
    if(slot.video.hidden && slot.video.paused)continue;
    const age=now-slot.at;
    slot.video.style.opacity=String(Math.max(0,Math.min(1,(slot.duration-age)/160)));
    if(slot.video.ended || age>slot.duration || reduced.checked || !$('#effects').checked) {slot.video.hidden=true;slot.video.pause();}
  }
  if(movingLight) {movingLight.intensity=reduced.checked || !$('#effects').checked ? 0 : sparkSlots.reduce((power,slot)=>power+Math.max(0,1-(now-slot.at)/600 )*2,0);}
  if(now-lastSignal>80){crystalScene?.setEnergy((movingLight?.intensity||0)/24,reduced.checked || $('#compare-still').checked);lastSignal=now;}
  document.body.classList.toggle('reduced',reduced.checked);
  document.body.classList.toggle('effects-off',!$('#effects').checked);
  if(spin) {
    const elapsed=(now-spin.started)/1000;
    const windup=superActive?.35:.65, travel=6.45-windup;
    if(elapsed<windup) wheel.rotation.z=spin.from+(superActive?.11:.075)*Math.sin(elapsed/windup*Math.PI);
    else {
      const p=Math.min((elapsed-windup)/travel,1);
      // Super keeps momentum longer, then reaches zero velocity without a final snap.
      const ease=superActive?1-Math.pow(1-p,3)*(1+3*p):1-Math.pow(1-p,4)*(1+4*p);
      wheel.rotation.z=spin.from+(spin.to-spin.from)*ease;
      const audioWedge=Math.floor(wheel.rotation.z/(Math.PI/6));
      if(audioWedge!==lastAudioWedge && now-lastClackAt>45) {wheelCue('clack');lastClackAt=now;}
      lastAudioWedge=audioWedge;
      peg.rotation.z=Math.sin(wheel.rotation.z*12)*0.055*(1-p);
      // Match contact intensity to each curve's normalized angular velocity.
      const sparkIntensity=superActive?p*Math.pow(1-p,2)/(4/27):p*Math.pow(1-p,3)/.10546875;
      if(sparkIntensity>.035 && now-lastSpark>135+(1-sparkIntensity)*320) burst(now,false,sparkIntensity);
      if(p>=1) finish();
      else if(superActive) copy(p>.78?'HERE IT COMES':'SUPER SPIN','Eyes on the prize.','Scripted visual proof · No credits awarded.');
      else copy(p>.78?'HERE IT COMES':'FIRST SPIN',p>.78?'Coming in hot.':'Make it multiply.',`${demoBase} AI Sparks locked. Watch the multiplier.`);
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
start().catch(error=>{if(embedded)parent.postMessage({type:'ootle-wheel-unavailable'},location.origin);$('#loading').textContent=`Wheel unavailable: ${error.message}`; console.error(error);});


function notifySettled() {
  wheelCue('bank');
  if(embedded) parent.postMessage({type:'ootle-wheel-settled'},location.origin);
}
function playSparkBurst() {
  if(!embedded || reduced.checked || !$('#effects').checked) return;
  const bounds=$('#stage').getBoundingClientRect();
  parent.postMessage({type:'ootle-wheel-celebrate', intense:superActive,
    stage:{x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2,radius:bounds.height<400?123:148}},location.origin);
}

if(embedded) {
  new ResizeObserver(()=>parent.postMessage({type:'ootle-wheel-size',height:Math.ceil($('main').getBoundingClientRect().height)+8},location.origin)).observe($('main'));
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==parent || event.data?.type!=='ootle-wheel-motion') return;
    reduced.checked=Boolean(event.data.reduced);
    if(reduced.checked && spin) finish();
  });
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==parent || event.data?.type!=='ootle-wheel-active') return;
    autoActive=event.data.active===true;
    queueAutoSpin();
  });
  addEventListener('pagehide',()=>clearTimeout(autoSpinTimer));
  let approvedClick=false, awaitingResult=false;
  for(const [id,action] of [['spin',null],['decline-super','decline']]) {
    $('#'+id).addEventListener('click',event=>{
      clearTimeout(autoSpinTimer);
      if(approvedClick) return;
      event.stopImmediatePropagation();
      if(awaitingResult || spin) return;
      awaitingResult=true;
      parent.postMessage({type:'ootle-wheel-request',action:action || (superActive?'super':'spin')},location.origin);
    },true);
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin || event.source!==parent || event.data?.type!=='ootle-wheel-result' || !awaitingResult) return;
    const result=event.data;
    if(result.action==='spin') $('#target').value=String(result.spinIndex===5?11:result.spinIndex);
    if(result.action==='super') $('#target').value=String(superOutcomes.findIndex(row=>row.factor===result.superFactor));
    awaitingResult=false; approvedClick=true;
    $('#'+(result.action==='decline'?'decline-super':'spin')).click();
    approvedClick=false;
  });

}

// The disc is a second accessible trigger for the same guarded primary action.
const wheelHit = document.createElement('button');
wheelHit.id = 'wheel-spin-hit'; wheelHit.type = 'button';
$('#stage').append(wheelHit);
const primarySpin = $('#spin');
function syncWheelTrigger() {
  wheelHit.disabled = primarySpin.disabled || primarySpin.hidden;
  wheelHit.setAttribute('aria-label', primarySpin.textContent.trim());
}
wheelHit.addEventListener('click', () => {
  if (!primarySpin.disabled && !primarySpin.hidden) primarySpin.click();
});
new MutationObserver(syncWheelTrigger).observe(primarySpin, {attributes:true, attributeFilter:['disabled','hidden'], childList:true, subtree:true, characterData:true});
syncWheelTrigger();

function reloadCrystal(){
  crystalScene?.dispose();
  const host=$('#crystal-hub');
  if(!host)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    crystalScene=mountCrystal(host,{query:`reward&idle&wheel&spinner&palette=${chosenPalette.id}&energy=${$('#energy').value}`,onReady:resolve,onError:reject});
  });
}
addEventListener('pagehide',event=>{if(!event.persisted)crystalScene?.dispose();});
