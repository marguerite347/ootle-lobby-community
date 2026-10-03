import {crystalPalettes} from './palettes.js';
import {createSpiralOrbit} from './SpiralOrbit.js';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
export function mountCrystal(host, {query = '', onReady = () => {}, onError = () => {}} = {}) {
const params=new URLSearchParams(query);
let disposed=false, ready=false;

const electric=params.get('energy')!=='flame';
const selectedPalette=crystalPalettes.find(item=>item.id===params.get('palette'))||crystalPalettes[Math.floor(Math.random()*crystalPalettes.length)];
const shellColor=selectedPalette.facet,coreColor=selectedPalette.core,edgeColor=selectedPalette.edge;
const wheelEmbed=params.has('wheel');
let contactEnergy=0;
const embedded=params.has('reward');

const reduced=params.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced, chargeAt=-100, dragging=false, pointerX=0, pointerY=0;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,stencil:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(host.clientWidth,Math.max(1,host.clientHeight));
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
// Present completed frames through Canvas2D. Keep the transparent WebGL surface
// detached so reset/visibility transitions cannot expose its compositor layer.
const presentation=document.createElement('canvas');
const context=presentation.getContext('2d',{alpha:true});
if(!context){renderer.dispose();throw new Error('Crystal presentation unavailable');}
Object.assign(presentation.style,{width:'100%',height:'100%',display:'block',visibility:'hidden'});
host.append(presentation);
let contextLost=false;
const loseContext=event=>{event.preventDefault();contextLost=true;};
const restoreContext=()=>{
 environment.dispose();environment=createEnvironment();scene.environment=environment.texture;
 contextLost=false;
};
renderer.domElement.addEventListener('webglcontextlost',loseContext);
renderer.domElement.addEventListener('webglcontextrestored',restoreContext);
const scene=new THREE.Scene();scene.background=embedded?null:new THREE.Color(0x040723);const camera=new THREE.PerspectiveCamera(38,host.clientWidth/Math.max(1,host.clientHeight),.1,100);camera.position.set(0,.15,7);
function createEnvironment(){
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
 const result=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();return result;
}
let environment=createEnvironment();scene.environment=environment.texture;
scene.add(new THREE.HemisphereLight(0xc9b6ff,0x040723,.45));
const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(-3,4,4);scene.add(key);


const group=new THREE.Group();scene.add(group);
const glass=new THREE.MeshPhysicalMaterial({color:0x713ac6,metalness:.35,roughness:.16,transmission:.15,thickness:.7,attenuationColor:0x813bf5,attenuationDistance:1.5,ior:1.5,clearcoat:1,clearcoatRoughness:.06,iridescence:.5,iridescenceIOR:1.4,envMapIntensity:.65,side:THREE.FrontSide});
if(wheelEmbed){glass.color.set(shellColor);glass.metalness=0;glass.transparent=true;glass.opacity=.82;glass.depthWrite=false;glass.transmission=.48;glass.roughness=.065;glass.thickness=.55;glass.attenuationColor.set(edgeColor);glass.envMapIntensity=.9;glass.specularIntensity=.65;glass.clearcoat=.7;glass.clearcoatRoughness=.1;}

const contactLight=new THREE.PointLight(0xeaff9b,0,8);contactLight.position.set(1,2,2);scene.add(contactLight);
// Directional facet shading strengthens cut planes without a broad emissive wash.
if(wheelEmbed) glass.onBeforeCompile=shader=>{
 shader.uniforms.edgeTint={value:new THREE.Color(edgeColor)};
 shader.uniforms.facetTint={value:new THREE.Color(shellColor)};
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 edgeTint; uniform vec3 facetTint;').replace('#include <opaque_fragment>', 'float faceLight=max(dot(normal,normalize(vec3(-0.8,0.65,1.0))),0.0); float edgeShade=pow(1.0-abs(normal.z),2.0); vec3 cutColor=mix(edgeTint,facetTint,smoothstep(0.12,0.85,faceLight)*(1.0-edgeShade*0.65)); outgoingLight=mix(outgoingLight,cutColor,0.65);\n#include <opaque_fragment>');
};
// Keep radiance inside the mesh: no painted glow on the outer facets.
const core=new THREE.Mesh(wheelEmbed ? new THREE.SphereGeometry(.16,32,24) : new THREE.OctahedronGeometry(.21),new THREE.MeshBasicMaterial({color:0xc9eb00}));core.scale.set(.7,1.5,.7);if(wheelEmbed){core.material.color.set(coreColor).multiplyScalar(1.8);core.material.toneMapped=false;}group.add(core);
if(wheelEmbed){const coreLight=new THREE.PointLight(coreColor,1.35,2,2);group.add(coreLight);}
const halo=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{power:{value:.3},tint:{value:new THREE.Color(wheelEmbed?shellColor:0x7a2eff)}},vertexShader:'varying vec2 uvPosition; void main(){uvPosition=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvPosition; uniform float power; uniform vec3 tint; void main(){float d=length(uvPosition-.5);float a=pow(max(0.,1.-d*2.),3.)*power;if(a<0.003)discard;gl_FragColor=vec4(tint,a);}'}));halo.position.z=-.5;halo.renderOrder=-2;scene.add(halo);
let flame;
if(wheelEmbed){
 core.visible=false;
 // Soft volumetric-looking flame, with no opaque geometry or hard silhouette.
 flame=new THREE.Mesh(new THREE.PlaneGeometry(.62,.98),new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{tint:{value:new THREE.Color(coreColor)},time:{value:0},electric:{value:electric?1:0}},
  vertexShader:'varying vec2 flameUv; void main(){flameUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec2 flameUv; uniform vec3 tint; uniform float time; uniform float electric;
   void main(){
    float y=flameUv.y;
    float sway=sin(time*2.8+y*5.0)*0.045*y*y;
    float x=flameUv.x-0.5-sway;
    float width=mix(0.25,0.035,smoothstep(0.28,0.95,y));
    float body=exp(-2.5*x*x/(width*width));
    float envelope=smoothstep(0.02,0.22,y)*(1.0-smoothstep(0.60,0.98,y));
    float softness=body*envelope;
    float heart=exp(-((x*x)*100.0+(y-0.35)*(y-0.35)*28.0));
    float breath=0.92+0.08*sin(time*3.2);
    vec3 color=mix(tint,tint*0.65+vec3(0.35),heart*0.32);
    if(electric>0.5){
     vec2 p=flameUv-0.5;
     float tick=floor(time*7.0);
     float bend=sin(tick*2.1)*0.04;
     float path=sin(p.y*28.0+tick)*0.055+sin(p.y*51.0-tick)*0.022+bend;
     float arc=exp(-abs(p.x-path)*95.0)*(1.0-smoothstep(0.18,0.47,abs(p.y)));
     float branchPath=p.y*0.55+sin(p.y*38.0+tick)*0.025;
     float branch=exp(-abs(p.x-branchPath)*110.0)*(1.0-smoothstep(0.05,0.3,abs(p.y)));
     float aura=exp(-dot(p*vec2(5.0,3.4),p*vec2(5.0,3.4)));
     float center=exp(-dot(p,p)*350.0);
     float intensity=arc+branch*0.65+center;
     float boundary=smoothstep(0.0,0.12,flameUv.x)*smoothstep(0.0,0.12,1.0-flameUv.x)*smoothstep(0.0,0.12,flameUv.y)*smoothstep(0.0,0.12,1.0-flameUv.y);
     if((intensity+aura*0.32)*boundary<0.003)discard;
     gl_FragColor=vec4(mix(tint,vec3(1.0),min(0.45,intensity*0.22)),min(1.0,intensity+aura*0.32)*boundary);
    }else gl_FragColor=vec4(color,softness*breath*0.95);
   }`
 }));flame.renderOrder=1;flame.position.set(0,.08,.06);scene.add(flame);
}

// Spinner crystals keep their inner energy and rotation without the standalone orbit.
const spinnerEmbed=params.has('spinner');
const spiral=spinnerEmbed ? null : createSpiralOrbit(scene,reduced,embedded,wheelEmbed);
const clock=new THREE.Clock();let model;
new GLTFLoader().load(new URL('./crystal.glb',import.meta.url).href,gltf=>{
 if(disposed){disposeTree(gltf.scene);return;}
 model=gltf.scene;const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());
 model.position.sub(center);const wrapper=new THREE.Group();wrapper.add(model);wrapper.scale.set(1.4/size.x,2.3/size.y,1.1/size.z);group.add(wrapper);
 const crystalMeshes=[];model.traverse(object=>{if(object.isMesh)crystalMeshes.push(object);});
 crystalMeshes.forEach(object=>{if(object.isMesh){const original=object.material;for(const material of (Array.isArray(original)?original:[original])){for(const value of Object.values(material))if(value?.isTexture)value.dispose();material.dispose();}object.material=glass;object.geometry.computeVertexNormals();if(wheelEmbed){glass.flatShading=true;object.renderOrder=2;
// An opaque dark silhouette isolates the translucent gem from the separate wheel canvas.
const orbitMask=new THREE.Mesh(object.geometry,new THREE.MeshBasicMaterial({color:0x10091f,transparent:false,opacity:1,colorWrite:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp}));orbitMask.renderOrder=-1;object.add(orbitMask);
const edges=new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry,48),new THREE.LineBasicMaterial({color:edgeColor,transparent:true,opacity:.28,depthWrite:false}));edges.renderOrder=3;object.add(edges);}}});
 ready=true;if(embedded&&!params.has('idle'))chargeAt=motionTime;
},undefined,()=>{if(!disposed)onError(new Error('Crystal model failed to load'));});
presentation.onpointerdown=e=>{dragging=true;pointerX=e.clientX;pointerY=e.clientY;presentation.setPointerCapture(e.pointerId);};
presentation.onpointermove=e=>{if(!dragging)return;group.rotation.y+=(e.clientX-pointerX)*.008;group.rotation.x=THREE.MathUtils.clamp(group.rotation.x+(e.clientY-pointerY)*.004,-.6,.6);pointerX=e.clientX;pointerY=e.clientY;};presentation.onpointerup=()=>dragging=false;presentation.onpointercancel=()=>dragging=false;
let renderWidth=0,renderHeight=0;
function resize(){
 const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
 if(width===renderWidth&&height===renderHeight)return;
 renderWidth=width;renderHeight=height;
 camera.aspect=width/height;camera.position.z=embedded?5.2:(width<600?12:7);camera.updateProjectionMatrix();
 renderer.setSize(width,height);
 // Resize the visible canvas only when the next complete frame is available.
}const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
let previous=0,motionTime=0;renderer.setAnimationLoop(()=>{
 const time=clock.getElapsedTime(),delta=Math.min(time-previous,.05);previous=time;
 if(!paused)motionTime+=delta;
 const beat=motionTime-chargeAt;const energy=beat>=0&&beat<3?Math.sin(beat/3*Math.PI):0;
 if(!paused&&!dragging)group.rotation.y+=delta*(.35+energy*1.1);
 group.position.y=paused?0:Math.sin(motionTime*1.1)*.07;
 group.scale.setScalar(1+(reduced?0:energy*.12));core.rotation.y=motionTime;core.scale.setScalar(.8+energy*.9);
 glass.emissive.setHex(wheelEmbed?0xf3a9ff:0x813bf5);glass.emissiveIntensity=(wheelEmbed ? 0 : .015)+energy*.06;
 halo.material.uniforms.power.value=.3+energy*.9;
 if(flame)flame.material.uniforms.time.value=motionTime;
 spiral?.update(energy,paused || document.hidden,host.clientWidth);
 contactLight.intensity=contactEnergy*8;
 if(document.hidden||contextLost||renderer.getContext().isContextLost())return;
 renderer.render(scene,camera);
 if(contextLost||renderer.getContext().isContextLost()||!model)return;
 const source=renderer.domElement;
 if(presentation.width!==source.width||presentation.height!==source.height){
  presentation.width=source.width;presentation.height=source.height;
 }
 // Synchronous GPU canvas copy before WebGL discards its drawing buffer.
 // 'copy' replaces transparent pixels as well, without leaving rotation trails.
 context.globalCompositeOperation='copy';
 context.drawImage(source,0,0);
 if(ready){ready=false;presentation.style.visibility='visible';onReady();}
});

return {
  setEnergy(value,still=false){paused=still;contactEnergy=still?0:Math.min(1,Math.max(0,Number(value)||0));},
  charge(){chargeAt=motionTime;},
  setPaused(value){paused=value;},
  setLighting(value){spiral?.setLighting(value);},
  dispose(){
    if(disposed)return;disposed=true;
    renderer.setAnimationLoop(null);resizeObserver.disconnect();spiral?.dispose();
    disposeTree(scene);
    renderer.domElement.removeEventListener('webglcontextlost',loseContext);
    renderer.domElement.removeEventListener('webglcontextrestored',restoreContext);
    environment.dispose();renderer.dispose();presentation.remove();
  }
};
}

function disposeTree(root){
  const resources=new Set();
  root.traverse(object=>{
    if(object.geometry)resources.add(object.geometry);
    for(const material of (Array.isArray(object.material)?object.material:[object.material]))if(material){
      resources.add(material);
      for(const value of Object.values(material))if(value?.isTexture)resources.add(value);
    }
  });
  for(const resource of resources)resource.dispose();
}
