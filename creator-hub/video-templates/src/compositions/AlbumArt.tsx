import React from 'react';
import {useCurrentFrame} from 'remotion';
import {albumFrame} from '../album/frame.mjs';
export const AlbumArt:React.FC<{title:string}>=({title})=>{
 const frame=useCurrentFrame();
 return <div style={{width:640,height:360}} dangerouslySetInnerHTML={{__html:albumFrame(title,frame)}}/>;
};
