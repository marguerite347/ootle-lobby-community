import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import confetti from 'canvas-confetti';
import {MILESTONE_EVENT, type CreatorMilestone} from './creatorMilestones';
import './HubMotion.css';
import {createCometCursor} from './cometCursor';

// Versioned so earlier "off" choices reset once: effects are on by default for everyone.
// Bump the version only when the default must be re-applied to every browser.
const EFFECTS_STORAGE_KEY = 'hub-effects:v2';

const milestones = {
 created: {title: 'You’re in.', text: 'Project created. Time to cook.'},
 saved: {title: 'Progress, preserved.', text: 'A new version is saved. Keep building.'},
 published: {title: 'You made it playable.', text: 'Your Riff is published in the Hub.'},
};

export function HubMotion(){
 const cursor = useRef<HTMLCanvasElement>(null);
 const [enabled, setEnabled] = useState(() => {
  try {return localStorage.getItem(EFFECTS_STORAGE_KEY) !== 'off';} catch {return true;}
 });
 const [effectsSlot, setEffectsSlot] = useState<HTMLElement | null>(null);
 useLayoutEffect(() => {
  setEffectsSlot(document.querySelector<HTMLElement>('[data-effects-slot]'));
 }, []);
 const [burst,setBurst]=useState<{id:number,x:number,y:number}|null>(null);
 const [milestone,setMilestone]=useState<CreatorMilestone|null>(null);
 useEffect(()=>{
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let burstTimer:ReturnType<typeof setTimeout>, noticeTimer:ReturnType<typeof setTimeout>;
  const comet = cursor.current ? createCometCursor(cursor.current) : null;
  const hide = () => comet?.hide();
  const move = (event:PointerEvent) => {
   if(!enabled || reduced.matches || !fine.matches || event.pointerType!=='mouse') {hide();return;}
   if(event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable=true]')) {hide();return;}
   comet?.move(event.clientX,event.clientY);
  };
  const click=(event:MouseEvent)=>{
   if(!enabled || reduced.matches || !(event.target instanceof Element)) return;
   const target=event.target.closest('button,a,summary');
   if(!target || target.matches(':disabled,[aria-disabled="true"]'))return;
   const box=target.getBoundingClientRect();
   setBurst({id:performance.now(),x:event.detail?event.clientX:box.x+box.width/2,y:event.detail?event.clientY:box.y+box.height/2});
   clearTimeout(burstTimer);burstTimer=setTimeout(()=>setBurst(null),750);
  };
  const celebrate=(event:Event)=>{
   const kind=(event as CustomEvent<CreatorMilestone>).detail;
   if(!Object.prototype.hasOwnProperty.call(milestones,kind))return;
   setMilestone(kind);
   clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>setMilestone(null),4600);
   if(!enabled || reduced.matches)return;
   confetti({particleCount:kind==='published'?100:60, spread:85, startVelocity:32,
    origin:{x:.5,y:.7}, colors:['#d5f544','#b99aff','#a5e6cf','#ffffff'],
    disableForReducedMotion:true, ticks:160, zIndex:9998});
  };
  const preferencesChanged=()=>{hide();setBurst(null);confetti.reset();};
  document.documentElement.dataset.hubEffects=enabled?'on':'off';
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerleave',hide);
  window.addEventListener('scroll',hide,{passive:true});
  fine.addEventListener('change',preferencesChanged);
  document.addEventListener('click',click);
  window.addEventListener('blur',hide);
  window.addEventListener(MILESTONE_EVENT,celebrate);
  reduced.addEventListener('change',preferencesChanged);
  return()=>{
   document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',hide);
   document.removeEventListener('click',click);window.removeEventListener('blur',hide);
   window.removeEventListener('scroll',hide);fine.removeEventListener('change',preferencesChanged);
   window.removeEventListener(MILESTONE_EVENT,celebrate);reduced.removeEventListener('change',preferencesChanged);
   clearTimeout(burstTimer);clearTimeout(noticeTimer);hide();confetti.reset();
  };
 },[enabled]);
 function toggleEffects(){
  const next=!enabled;setEnabled(next);setBurst(null);setMilestone(null);
  try{localStorage.setItem(EFFECTS_STORAGE_KEY,next?'on':'off');}catch{/* Session preference still works. */}
 }
 return <>
  <canvas ref={cursor} className="hub-cursor" aria-hidden="true"/>
  {burst&&<div key={burst.id} className="hub-burst" aria-hidden="true" style={{left:burst.x,top:burst.y}}><b/>{Array.from({length:10},(_,index)=><i key={index} style={{'--angle':`${index*36}deg`} as CSSProperties}/>)}</div>}
  <div className="hub-milestone-region" role="status" aria-live="polite" aria-atomic="true">
   {milestone&&<div className="hub-milestone" key={milestone}><span aria-hidden="true">✦</span><div><strong>{milestones[milestone].title}</strong><p>{milestones[milestone].text}</p></div><button aria-label="Dismiss celebration" onClick={()=>setMilestone(null)}>×</button></div>}
  </div>
  {effectsSlot
   ? createPortal(<button type="button" className="hub-effects-toggle" aria-pressed={enabled} onClick={toggleEffects}>✦ Effects {enabled?'on':'off'}</button>, effectsSlot)
   : <button type="button" className="hub-effects-toggle is-waiting" aria-pressed={enabled} onClick={toggleEffects}>✦ Effects {enabled?'on':'off'}</button>}
 </>;
}

export function JourneyArt({step}:{step:number}){
 return <div className={`journey-art art-${step}`} aria-hidden="true"><svg viewBox="0 0 240 160" fill="none">
  <ellipse className="artifact-shadow" cx="120" cy="137" rx="48" ry="7" fill="currentColor" opacity=".14"/>
  <g className="artifact-orbit" stroke="currentColor" opacity=".3"><ellipse cx="120" cy="80" rx="86" ry="45"/><path d="M32 80h9m158 0h9M120 29v9m0 84v9"/></g>
  <g className="artifact-body" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
   {step===0&&<><circle cx="120" cy="77" r="43" fill="#211935"/><circle cx="120" cy="77" r="33" strokeDasharray="2 8"/><g className="compass-needle"><path d="m137 49-8 37-26 19 8-37z" fill="currentColor"/><path d="m137 49-26 19 18 18z" fill="#eee5ff"/></g><circle cx="120" cy="77" r="5" fill="#161022"/></>}
   {step===1&&<><path d="M62 49q30-13 58 4 28-17 58-4v66q-32-10-58 4-28-14-58-4z" fill="#211935"/><path d="M120 53v66M74 65q20-5 34 3m-34 10q20-5 34 3m-34 10q20-5 34 3M132 68h31m-31 13h25m-25 13h30"/><path className="book-star" d="m120 16 5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="currentColor"/></>}
   {step===2&&<><path d="m120 22 39 34-10 46-29 28-29-28-10-46z" fill="#332454"/><path d="m120 22 13 34-13 74-13-74z" fill="currentColor"/><path d="M81 56h78M91 102l29-80 29 80"/><path className="build-ring" d="M64 95q56 34 112-4" stroke="#d5f544" strokeWidth="4"/></>}
   {step===3&&<><path d="m84 38 27 16v32l-27 16-27-16V54z" fill="#302244"/><path d="m156 65 27 16v32l-27 16-27-16V81z" fill="#302244"/><path d="m57 54 27 16 27-16M84 70v32m45-21 27 16 27-16m-27 16v32"/><path className="remix-link" d="M117 41q42-13 49 16m-44 62q-42 13-49-10" stroke="#d5f544" strokeWidth="3"/><path d="m159 50 7 8 7-8m-107 66 7-8 7 8" stroke="#d5f544"/></>}
  </g>
  <g className="artifact-sparks" fill="currentColor"><path d="m48 32 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="m194 102 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><circle cx="186" cy="35" r="3"/></g>
 </svg></div>;
}
