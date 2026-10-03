import{scenes}from './scenes.mjs';
import{C,T}from './art.mjs';
export function albumFrame(title,frame=0){
 const scene=scenes[title]; if(!scene)throw Error(`No authored scene for ${title}`);
 const t=frame/96*Math.PI*2;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><defs><radialGradient id="atmos"><stop stop-color="#1E1641"/><stop offset="1" stop-color="${C.ink}"/></radialGradient></defs><rect width="640" height="360" fill="url(#atmos)"/>${scene.draw(t)}<rect x="0" y="312" width="640" height="48" fill="${C.ink}"/>${T(24,338,title,Math.min(19,570/(title.length*.56)),C.paper)}<path d="M24 348H616" stroke="${C.purple}" stroke-width="1"/></svg>`;
}
