import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {fontFamily} from '../components/base';

export const DiscoveryCover: React.FC<{title:string;kind:string;ecosystem:string;variant:number}> = ({title,kind,ecosystem,variant}) => {
 const t=useCurrentFrame()/96*Math.PI*2;
 const modes=['blocks','cards','orbit','wave'];
 const mode=modes[variant%4];
 const colors=['#C9EB00','#813BF5','#ECEEFF'];
 return <AbsoluteFill style={{background:'#040723',color:'#ECEEFF',fontFamily,overflow:'hidden'}}>
  <svg viewBox="0 0 640 360" style={{position:'absolute',inset:0}}>
   <defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#ECEEFF" opacity=".12"/></pattern></defs>
   <rect width="640" height="360" fill="url(#dots)"/>
   <g transform="translate(490 165)">
    {mode==='orbit' && [0,1,2].map(i=><g key={i} transform={`rotate(${i*60+Math.sin(t)*15})`}><ellipse rx="110" ry="44" fill="none" stroke={colors[i]} strokeWidth="2"/><circle cx={110*Math.cos(t+i)} cy={44*Math.sin(t+i)} r="9" fill={colors[i]}/></g>)}
    {mode==='cards' && [-1,0,1].map((n,i)=><g key={i} transform={`translate(${n*42} ${Math.sin(t+i)*16}) rotate(${n*18+Math.sin(t)*5})`}><rect x="-43" y="-67" width="86" height="134" rx="10" fill={colors[i]} stroke="#040723" strokeWidth="3"/><path d="M0 -24 L20 0 L0 24 L-20 0 Z" fill="#040723"/></g>)}
    {mode==='blocks' && [0,1,2,3].map(i=><g key={i} transform={`translate(${(i%2)*68-45} ${Math.floor(i/2)*68-45+Math.sin(t+i)*12}) rotate(${Math.sin(t+i)*12})`}><rect x="-26" y="-26" width="52" height="52" rx="8" fill={colors[i%3]}/><path d="M-12 0 H12 M0 -12 V12" stroke="#040723" strokeWidth="3"/></g>)}
    {mode==='wave' && Array.from({length:13},(_,i)=><rect key={i} x={i*16-104} y={-15-Math.sin(t+i*.45)*25} width="8" height={65+Math.sin(t+i*.45)*50} rx="4" fill={colors[i%3]}/>)}
   </g>
  </svg>
  <div style={{position:'absolute',top:26,left:30,fontSize:11,letterSpacing:2,color:'#C9EB00'}}>OOTLE LOBBY / {kind.toUpperCase()}</div>
  <div style={{position:'absolute',left:30,top:100,width:325,fontSize:title.length>55?24:30,fontWeight:800,lineHeight:1.15,letterSpacing:-.7,overflowWrap:'anywhere'}}>{title}</div>
  <div style={{position:'absolute',left:30,bottom:28,fontSize:12,color:'#c9b6ff'}}>{ecosystem} <span style={{color:'#999bb1'}}>· Generated resource cover</span></div>
 </AbsoluteFill>;
};
