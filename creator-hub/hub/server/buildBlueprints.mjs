import {randomInt} from 'node:crypto';
import {buildToolkit} from './buildToolkit.mjs';
import {detectToolkitEngine} from './buildSetup.mjs';

const THEMES=['a bioluminescent garden','a tiny orbital repair station','a playful paper-craft world','a neon underwater archive'];
const TWISTS=[
 {text:'Add one optional bonus objective with its own progress indicator.',component:'Optional bonus objective + progress HUD'},
 {text:'Expose one safe difficulty setting and demonstrate two configurations.',component:'Editable difficulty parameter + bounded validation'},
 {text:'Add a short how-to-play interaction before the first attempt.',component:'Interactive onboarding + replay control'},
];
const PROFILES=[
 {engine:'godot',name:'Godot',loop:'a 2D puzzle platformer: collect three keys, open the exit, and restart instantly',components:['CharacterBody2D movement + collisions','Area2D collectibles + exit condition','Control HUD + retry scene'],skills:['gamedev-godot-2d-movement','gamedev-godot-signals-groups','gamedev-game-feel'],trial:'Finish one room with keyboard controls, reach the exit only after collecting three keys, and restart after failure.'},
 {engine:'phaser',name:'Phaser',loop:'a browser arcade collector: dodge hazards, gather five energy sparks, and reach a safe zone',components:['Phaser scene + Arcade Physics input','Overlap handlers + objective state','Scene HUD + win/lose/restart'],skills:['gamedev-phaser-core','gamedev-phaser-arcade-physics','gamedev-game-ui-ux'],trial:'Collect five sparks, trigger both hazard failure and safe-zone success, then restart without stale score or timers.'},
 {engine:'gdevelop',name:'GDevelop',loop:'a small top-down maze: activate three switches to open a goal gate',components:['Movement behavior + obstacle collision','Event conditions + scene variables','Goal gate + result/retry events'],skills:['gamedev-level-design','gamedev-game-feel','gamedev-game-ui-ux'],trial:'Activate the switches in any order, keep the gate closed until all three are active, and reset the room correctly.'},
];
function invalid(message,status=400){return Object.assign(new Error(message),{status});}
export function rollToolkit(records,{idea='',resourceId='',projectId='',previous=''}={},pick=randomInt,projects=[]){
 const choose=typeof pick==='function'?pick:randomInt;
 if(typeof idea!=='string'||idea.length>600||typeof resourceId!=='string'||resourceId.length>200||typeof projectId!=='string'||projectId.length>81||typeof previous!=='string'||previous.length>160)throw invalid('Invalid roll context.');
 const selected=resourceId?records.find(item=>item.id===resourceId):null;
 if(resourceId&&!selected)throw invalid('Selected foundation not found.',404);
 const anchor=selected?`${selected.ecosystem||''} ${selected.title} ${(selected.tags||[]).join(' ')}`:idea;
 const engine=detectToolkitEngine(anchor);
 const profiles=selected?[{engine:engine||'inherited',name:engine||'the selected foundation’s engine',loop:`a focused Riff of ${selected.title}: keep its core interaction, add a clear objective and a satisfying result`,components:['Existing foundation input / core interaction','Small objective or progress state','Readable feedback + reset/retry'],skills:[],trial:'Run the foundation unchanged, then demonstrate one added objective, its completion feedback and a clean reset without breaking the original interaction.'}]:engine?(PROFILES.filter(profile=>profile.engine===engine).length?PROFILES.filter(profile=>profile.engine===engine):[{engine,name:engine,loop:'a tiny interactive challenge: perform one action, track a goal, and show a clear result',components:['Native engine input or trigger','Goal state + success condition','Feedback + reset'],skills:[],trial:'Confirm the selected engine and project version, then prove input → goal → result → reset using native components.'}]):PROFILES;
 const choices=profiles.flatMap(profile=>THEMES.flatMap((theme,index)=>TWISTS.map((twist,twistIndex)=>({id:`${profile.engine}-${index}-${twistIndex}`,profile,theme,twist})))).filter(choice=>choice.id!==previous);
 const choice=choices[choose(choices.length)],{profile,theme}=choice;
 const rolledIdea=`Using ${profile.name}, build ${profile.loop}. Set it in ${theme}. ${choice.twist.text} Keep the first build to one playable scene with placeholder art and clear feedback.`.slice(0,600);
 const toolkit=buildToolkit(records,{idea:rolledIdea,resourceId,projectId},{skillIds:profile.skills.length?[...profile.skills,'gamedev-prototype-fast','resource-first-workflow']:[],projects});
 const blueprint={id:choice.id,engine:profile.name,title:selected?`${selected.title} · a new twist`:`${profile.name} · one small world`,theme:choice.theme,components:[...profile.components,choice.twist.component],acceptance:profile.trial+' Then verify the added feature and its reset behavior.',foundationPreserved:Boolean(selected),skillIds:profile.skills};
 toolkit.brief+=`\n\nROLLED BLUEPRINT\n${blueprint.title}\nEngine: ${blueprint.engine}\nTheme: ${blueprint.theme}\nComponent roles (to implement/verify, not installed packages):\n${blueprint.components.map((item,index)=>`${index+1}. ${item}`).join('\n')}\nFirst playable acceptance: ${blueprint.acceptance}\nRead these additional curated skills before implementation:\n${toolkit.skills.map(skill=>`- ${skill.title}: ${skill.instructions} (${skill.version})`).join('\n')||'- Select engine-native skills after confirming the foundation manifest.'}`;
 return {...toolkit,blueprint};
}
