import {useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import './RemixInvitation.css';

// The stock is atmosphere; the editable foreground tells the remix story.
export default function RemixInvitation(){
 const video = useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const element=video.current;
  if(!element)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false;
  const sync=()=>{
   const enabled=!reduced.matches && document.documentElement.dataset.hubEffects!=='off';
   if(visible && enabled && !document.hidden){
    element.src ||= '/previews/remix-portal-v1.mp4';
    void element.play().catch(()=>{});
   } else element.pause();
  };
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
  const preferences=new MutationObserver(sync);
  intersection.observe(element);
  preferences.observe(document.documentElement,{attributes:true,attributeFilter:['data-hub-effects']});
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  return ()=>{intersection.disconnect();preferences.disconnect();reduced.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);element.pause();};
 },[]);
 return <Link className="remix-invitation" to="/projects?view=published" aria-label="Explore community originals and Riffs">
  <video ref={video} className="remix-portal-film" muted loop playsInline preload="none" poster="/previews/remix-portal-v1.jpg" aria-hidden="true"/>
  <div className="remix-portal-shade"/>
  <span className="remix-portal-eyebrow">A spark. A Riff.</span>
  <span className="remix-portal-plain">See originals and published Riffs.</span>
  <svg className="remix-portal-worlds" viewBox="0 0 600 360" fill="none" aria-hidden="true">
   <defs>
    <linearGradient id="portal-land" x2="0" y2="1"><stop stopColor="#b99aff"/><stop offset="1" stopColor="#271848"/></linearGradient>
    <linearGradient id="portal-crystal" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".4" stopColor="#c5a7ff"/><stop offset="1" stopColor="#813bf5"/></linearGradient>
    <linearGradient id="portal-remix" x2="0" y2="1"><stop stopColor="#d7fc67"/><stop offset="1" stopColor="#40785d"/></linearGradient>
   </defs>
   <ellipse cx="300" cy="204" rx="241" ry="89" stroke="#c6b0ff" strokeOpacity=".2" strokeDasharray="2 10"/>
   <path className="remix-portal-thread" d="M161 173C223 51 357 53 431 166" stroke="#e0caff" strokeWidth="2" strokeDasharray="2 9"/>
   <g className="remix-world-original">
    <ellipse cx="165" cy="229" rx="75" ry="15" fill="#ac7afa" opacity=".15"/>
    <path d="m87 184 77-32 80 32-79 83z" fill="url(#portal-land)"/><path d="m87 184 77-32 80 32-79 30z" fill="#7e639b" stroke="#ddc9ff"/><path d="m87 184 78 30v53" stroke="#b99aff"/>
    <path d="m165 87 27 53-27 49-27-49z" fill="url(#portal-crystal)" stroke="#e9dfff"/><path d="m165 87-7 56 7 46 27-49z" fill="#cfb6ff" opacity=".5"/>
    <circle cx="122" cy="161" r="5" fill="#e8d9ff"/>
   </g>
   <g className="remix-world-new">
    <ellipse cx="439" cy="241" rx="95" ry="18" fill="#b0ed86" opacity=".12"/>
    <path d="m337 194 96-42 103 42-104 96z" fill="url(#portal-land)"/><path d="m337 194 96-42 103 42-104 34z" fill="#456968" stroke="#b5efbb"/><path d="m337 194 95 34v62" stroke="#9dcca9"/>
    <path d="m428 73 31 63-31 58-31-58z" fill="url(#portal-crystal)" stroke="#f5eaff"/><path d="m428 73-6 66 6 55 31-58z" fill="#d8c2ff" opacity=".6"/>
    <path d="m478 131 18 35-18 36-18-36z" fill="url(#portal-remix)" stroke="#d8ff79"/>
    <path d="m384 153 12 24-12 23-12-23z" fill="url(#portal-remix)" stroke="#d8ff79"/>
    <ellipse cx="436" cy="164" rx="67" ry="19" transform="rotate(-22 436 164)" stroke="#d9fc7f" strokeWidth="2"/>
   </g>
   <g className="remix-portal-stars" fill="#e7d9ff"><path d="m291 142 5 17 17 5-17 5-5 17-5-17-17-5 17-5z"/><circle cx="95" cy="95" r="2"/><circle cx="525" cy="113" r="3"/><circle cx="315" cy="252" r="2"/></g>
   <text x="165" y="312" textAnchor="middle" fill="#ddc8ff">THE ORIGINAL</text><text x="438" y="324" textAnchor="middle" fill="#d6f794">YOUR NEXT POSSIBILITY</text>
  </svg>
  <span className="remix-invitation-caption"><span>One creation opens a world.<strong>See what happens next</strong></span><b aria-hidden="true">↗</b></span>
 </Link>;
}
