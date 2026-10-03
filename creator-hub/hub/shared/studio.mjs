import {validateWorkflow} from './workflow.mjs';
// The same recipe index drives the UI, agent endpoint and portable scaffolds.
export const STUDIO_STAGES = {
 brief: {title:'Creative brief', role:'tool', purpose:'Define audience, engine, visual style, budget and one playable success criterion.', query:'game design', path:'/create'},
 concept: {title:'Concept & style', role:'ai', purpose:'Approve one reference image before generating a batch. Hugging Face or a configured image provider requires verified access.', query:'game assets', path:'/explore?type=asset'},
 model: {title:'Build the asset', role:'ai', purpose:'Choose an existing asset or generate from the approved reference. Meshy via fal and open-model execution need a connected worker; no job runs here.', query:'3d assets', path:'/create/assets'},
 rig: {title:'Rig & deform', role:'tool', purpose:'Use a compatible pre-rigged character first. For a new rig, assess pose/topology, skeleton and skin weights; test shoulders, knees and hands. UniRig requires a separate runtime.', query:'rigging', path:'/skills?q=animation'},
 animate: {title:'Motion library', role:'tool', purpose:'Select idle, locomotion and action clips. Verify skeleton mapping, scale, root motion and transitions in the selected engine.', query:'animation', path:'/create/assets'},
 audio: {title:'Sound & impact', role:'tool', purpose:'Attach distinct event cues and bounded VFX. Audition gain, avoid clipping, respect mute and reduced motion.', query:'audio design', path:'/skills?category=audio'},
 preview: {title:'Playable acceptance', role:'output', purpose:'Import into the target engine; test the complete loop, animation transitions, mobile performance and recovery. Record actual evidence.', query:'testing', path:'/projects'},
 publish: {title:'Package & Riff', role:'output', purpose:'Save editable source, clips, controller, attribution and setup instructions. Review the preview before publishing; preserve forkable versions.', query:'publish', path:'/projects'},
 code: {title:'Scaffold the game', role:'ai', purpose:'Start from a supported foundation and read its skills. Use OpenRouter only through an authorized runtime; preview code in an isolated environment.', query:'game development', path:'/create'},
 capture: {title:'Capture & promote', role:'tool', purpose:'Capture real gameplay, cut a short editable sequence and check the final video and audio.', query:'demo capture', path:'/create/video'},
};
export const STUDIO_RECIPES = [
 {id:'character',title:'Character to playable',label:'RIG · MOVE · PLAY',description:'Give your character a skeleton, a signature move and a world to enter.',stages:['brief','concept','model','rig','animate','audio','preview','publish']},
 {id:'prop',title:'An asset with a purpose',label:'CONCEPT · BUILD · IMPORT',description:'Take a visual reference through a game-ready prop and an engine import check.',stages:['brief','concept','model','preview','publish']},
 {id:'game',title:'One great game loop',label:'IDEA · SCAFFOLD · PLAY',description:'Choose a foundation, connect its parts and prove one satisfying interaction.',stages:['brief','code','model','animate','audio','preview','publish']},
 {id:'celebration',title:'Make the win unforgettable',label:'MOTION · SOUND · PAYOFF',description:'Build a reusable reward kit with a victory motion, particles and a sound cue.',stages:['brief','animate','audio','preview','capture','publish']},
];
export function scaffoldStudio(id) {
 const recipe=STUDIO_RECIPES.find(item=>item.id===id);
 if(!recipe)throw new Error('Unknown Studio recipe');
 const nodes=recipe.stages.map((stage,index)=>({id:`studio-${stage}`,role:STUDIO_STAGES[stage].role,title:STUDIO_STAGES[stage].title,purpose:STUDIO_STAGES[stage].purpose,x:40+(index%3)*300,y:40+Math.floor(index/3)*190}));
 const edges=nodes.slice(1).map((node,index)=>({id:`studio-edge-${index}`,from:nodes[index].id,to:node.id,kind:'design',label:index===0?'approved brief':'reviewed output'}));
 return validateWorkflow({version:1,nodes,edges});
}
