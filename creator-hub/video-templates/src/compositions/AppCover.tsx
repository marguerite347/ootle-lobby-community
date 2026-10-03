import React from 'react';
import type { z } from 'zod';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../components/base';
import { fullHex } from '../cover.mjs';
import { BRAND } from '../brand.mjs';
import { appCoverSchema } from '../schemas.mjs';

type Props = z.infer<typeof appCoverSchema>;
const {ink,cloud,purple}=BRAND.colors;
// Editorial motion illustrations, never screenshots or evidence of integration.
const concepts: Record<string,{kind:string;line:string;tag:string}>={
 'Private Ballot':{kind:'ballot',line:'A voice. Without the exposure.',tag:'PRIVATE GOVERNANCE'},
 'ShadowTix':{kind:'ticket',line:'Your next entrance.',tag:'COMMUNITY TICKETING'},
 'Tari Market':{kind:'market',line:'A place for private exchange.',tag:'MARKETPLACE CONCEPT'},
 'Tari Agent Pay':{kind:'agent',line:'Payments for autonomous actors.',tag:'AGENT PAYMENTS CONCEPT'},
 'Tari Ootle Playground':{kind:'blocks',line:'Small primitives. Big possibilities.',tag:'COMPOSE · EXPERIMENT · BUILD'},
};
export const AppCover: React.FC<Props> = ({name,category,status,accent}) => {
 const frame=useCurrentFrame();const {width,height,durationInFrames}=useVideoConfig();
 const green=fullHex(accent || BRAND.colors.green);
 const wide=width/height>1.3;
 const t=frame/durationInFrames*Math.PI*2;
 const spec=concepts[name]||{kind:'blocks',line:category||'Explore the Tari ecosystem.',tag:category||'COMMUNITY PROJECT'};
 const light=spec.kind==='ballot';const bg=light?cloud:ink;const fg=light?ink:cloud;
 const phase=(i:number)=>t+i*1.25;
 const titleSize=Math.min(76,1450/Math.max(name.length,12));
 return <AbsoluteFill style={{fontFamily,background:bg,color:fg,overflow:'hidden'}}>
  <svg viewBox="0 0 1000 1000" width={wide?width*.65:width} height={height} preserveAspectRatio="xMidYMid meet" style={{position:'absolute',right:0,top:0}}>
   <defs>
    <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop stopColor={purple}/><stop offset="1" stopColor="#441B96"/></linearGradient>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke={fg} strokeOpacity=".08"/></pattern>
   </defs>
   <rect width="1000" height="1000" fill="url(#grid)"/>
   <circle cx="510" cy="410" r={240+15*Math.sin(t)} fill="none" stroke={purple} strokeWidth="1" opacity=".4"/>
   <circle cx="510" cy="410" r="320" fill="none" stroke={fg} opacity=".12" strokeDasharray="4 15"/>
   {spec.kind==='ballot' && <g transform={`translate(500 405) rotate(${Math.sin(t)*5})`}>
    {[2,1,0].map(i=><g key={i} transform={`translate(${i*28-115} ${i*22-160+12*Math.sin(phase(i))}) rotate(${-12+i*10} 120 160)`}>
      <rect width="245" height="320" rx="28" fill={i===0?purple:ink} stroke={cloud} strokeWidth="3"/>
      <path d="M45 62 H190 M45 90 H160" stroke={cloud} strokeWidth="8" opacity=".5"/>
      <circle cx="120" cy="190" r="60" fill={green}/><path d="M88 190 L112 213 L151 166" fill="none" stroke={ink} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
    </g>)}
    <path d="M-190 235 H190" stroke={ink} strokeWidth="12" strokeLinecap="round"/>
   </g>}
   {spec.kind==='ticket' && <g transform={`translate(500 400) rotate(${-15+5*Math.sin(t)})`}>
    {[-1,1].map((v,i)=><g key={v} transform={`translate(${-245+v*20*Math.sin(t)} ${v*105})`}>
      <path d="M0 -83 H480 V-25 Q445 0 480 25 V83 H0 V25 Q35 0 0 -25 Z" fill={i?green:purple}/>
      <path d="M350 -65 V65" stroke={ink} strokeWidth="3" strokeDasharray="7 9"/>
      <text x="55" y="12" fill={ink} fontSize="48" fontWeight="800">{i?'ADMIT ONE':'SHADOW'}</text>
      {Array.from({length:9},(_,j)=><rect key={j} x={380+j*7} y="-40" width={j%3===0?4:2} height="80" fill={ink}/>)}
    </g>)}
   </g>}
   {spec.kind==='market' && <g>
    {[0,1,2].map(i=><g key={i} transform={`translate(${260+i*230} ${390+35*Math.sin(phase(i))}) rotate(${(i-1)*12})`}>
      <rect x="-105" y="-130" width="210" height="260" rx="28" fill={i===1?green:'url(#face)'} stroke={cloud} strokeOpacity=".3" strokeWidth="2"/>
      <path d="M-55 -25 L0 -60 L55 -25 L55 45 L0 78 L-55 45 Z M-55 -25 L0 10 L55 -25 M0 10 V78" fill="none" stroke={i===1?ink:cloud} strokeWidth="7"/>
      <circle cx="65" cy="-85" r="12" fill={i===1?purple:green}/>
    </g>)}
    <path d="M260 600 Q500 690 740 600" stroke={green} strokeWidth="3" fill="none" strokeDasharray="12 15" strokeDashoffset={-27*frame/durationInFrames}/>
   </g>}
   {spec.kind==='agent' && <g>
    {[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;const x=500+255*Math.cos(a);const y=405+220*Math.sin(a);const progress=(Math.sin(t+a)+1)/2;return <g key={i}>
      <path d={`M500 405 L${x} ${y}`} stroke={purple} strokeWidth="3"/>
      <circle cx={500+(x-500)*progress} cy={405+(y-405)*progress} r="9" fill={green}/>
      <rect x={x-34} y={y-34} width="68" height="68" rx="18" fill={purple}/>
      <circle cx={x-11} cy={y-3} r="5" fill={cloud}/><circle cx={x+11} cy={y-3} r="5" fill={cloud}/>
    </g>})}
    <rect x="408" y="313" width="184" height="184" rx="45" fill={green} transform={`rotate(${8*Math.sin(t)} 500 405)`}/>
    <path d="M460 405 H540 M500 365 V445" stroke={ink} strokeWidth="14" strokeLinecap="round"/>
   </g>}
   {spec.kind==='blocks' && <g transform="translate(500 415)">
    {[0,1,2,3,4,5,6].map(i=>{const a=i*Math.PI*2/6;const x=i===6?0:210*Math.cos(a);const y=i===6?0:170*Math.sin(a);return <g key={i} transform={`translate(${x} ${y+12*Math.sin(phase(i))}) rotate(${i*15+4*Math.sin(t)})`}>
     <rect x="-62" y="-62" width="124" height="124" rx="22" fill={i===6?green:'url(#face)'} stroke={cloud} strokeOpacity=".35" strokeWidth="2"/>
     <path d="M-25 -15 L-40 0 L-25 15 M25 -15 L40 0 L25 15 M10 -28 L-10 28" fill="none" stroke={i===6?ink:cloud} strokeWidth="7" strokeLinecap="round"/>
    </g>})}
   </g>}
   {[0,1,2].map(i=><circle key={i} cx={500+340*Math.cos(t+i*2.1)} cy={410+310*Math.sin(t+i*2.1)} r={i===1?7:4} fill={light?purple:green}/>)}
  </svg>
  <div style={{position:'absolute',top:'6%',left:'7%',right:'7%',display:'flex',justifyContent:'space-between',fontSize:24,fontWeight:700,letterSpacing:3}}><span>TARI / ECOSYSTEM</span><span style={{opacity:.5}}>{status||'CONCEPT'}</span></div>
  <div style={{position:'absolute',bottom:wide?'25%':'7%',left:'7%',right:wide?'57%':'7%'}}>
   <div style={{fontSize:20,fontWeight:700,letterSpacing:3,color:light?purple:green,marginBottom:16}}>{spec.tag}</div>
   <div style={{fontSize:titleSize*Math.min(width,1100)/1000,fontWeight:800,lineHeight:1.08,letterSpacing:-2,overflowWrap:'anywhere'}}>{name}</div>
   <div style={{fontSize:25,opacity:.7,marginTop:15}}>{spec.line}</div>
  </div>
 </AbsoluteFill>;
};
