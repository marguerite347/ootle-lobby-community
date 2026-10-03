const ENGINE_GUIDES={
 canvas:{name:'Browser Canvas',url:'/skills?q=game%20feel',verify:'Use the existing HTML/JavaScript canvas source and a local HTTP server. Test real pointer, keyboard and touch input, pause/restart and the browser console; no external engine installation is required.'},
 godot:{name:'Godot',url:'/skills?q=Godot',verify:'Open the foundation in its pinned Godot version, run its existing scene, then confirm the intended export target works.'},
 phaser:{name:'Phaser',url:'/skills?q=Phaser',verify:'Use the project’s Node version and lockfile, install dependencies, run its existing browser scene and inspect the console.'},
 gdevelop:{name:'GDevelop',url:'/explore?q=GDevelop',verify:'Open the selected project in its supported GDevelop editor, run the preview and check the intended export path.'},
 unity:{name:'Unity',url:'/skills?q=Unity%20AI%20CLI',verify:'Install the project’s exact Unity Editor and target modules through Unity Hub; complete account/license setup and verify the selected CLI/editor connection on this project.'},
 unreal:{name:'Unreal',url:'/skills?q=Unreal%20Blueprint',verify:'Install the compatible Unreal version and plugins. Open the project, compile one Blueprint and Play In Editor. Confirm OS and build-target support.'},
 uefn:{name:'UEFN',url:'/skills?q=UEFN',verify:'Use the UEFN setup skill to verify the supported environment and Epic access. Test a device/Verse mechanic in a session; do not assume Unreal Blueprint plugins work here.'},
 'tari-ootle':{name:'Tari Ootle',url:'/skills?q=developer%20setup',verify:'Follow the pinned Tari setup skill, run a local template test and identify the selected network. Wallet access and a real testnet transaction are separate checks.'},
};
export function detectToolkitEngine(text='') {
 const normalized=text.toLowerCase().replace(/three\.js/g,'threejs');
 if(/\buefn\b|\bverse\b/.test(normalized))return 'uefn';
 for(const engine of ['gdevelop','godot','phaser','unity','unreal','bevy','roblox','pygame','love2d','pixijs','threejs','playcanvas','react'])if(new RegExp(`\\b${engine}\\b`).test(normalized))return engine;
 if(/\bcanvas(?:2d)?\b/.test(normalized))return 'canvas';
 if(/\bootle\b|\btari-ootle\b/.test(normalized))return 'tari-ootle';
 return null;
}
const requirement=(id,title,ask,verify,url,provider='core')=>({id,title,ask,verify,url,provider});
export function buildSetup(context,selected) {
 const engine=detectToolkitEngine(selected?`${selected.ecosystem||''} ${selected.title} ${(selected.tags||[]).join(' ')}`:context)||detectToolkitEngine(context);
 const guide=ENGINE_GUIDES[engine]||{name:engine||'Project-defined engine',url:'/agent-start',verify:'Confirm the exact engine, version, OS and build target from the foundation manifest. Run the existing project before adding dependencies.'};
 const requirements=[
  requirement('workspace','Workspace & delivery target','Which repository/project should I use, and should the result run in a browser or as a desktop/mobile build?','Read /agent-start.md and confirm your own writable workspace, source availability, lockfiles and build/export target. Private Lobby repository access is optional; report any missing original-game publication path.','/agent-start'),
  requirement('engine',`${guide.name} setup`,`${guide.name}: which machine will run it, and can you complete any editor installation or account sign-in the agent cannot do?`,guide.verify,guide.url),
  requirement('skills','Read the selected skills','May I use the suggested skills and components, or are there project constraints I should preserve?','Read the actual selected SKILL.md files; record paths/versions and applicable rules in BUILD_PLAN.md. A catalog link is not proof of reading.','/skills'),
  requirement('foundation','Foundation & components',selected?`Can I access ${selected.title} and its source, required assets and dependencies?`:'Which suggested starter should we use, or should the agent compare them first?','Check the foundation manifest and each selected component’s engine/API/version. Run the unmodified foundation; do not combine every search match.','/explore'),
  requirement('budget','Budget & boundaries','What are the time/cost limit and the actions that need your approval? Is a zero-spend local prototype preferred?','Honor existing authorization. Record budget and checkpoints; do not enable paid calls simply to test access.','/agent-start'),
  requirement('trial','First playable trial','What should I demonstrate for you to accept this first playable slice?','Run the small success test, record commands and observed behavior, and distinguish playable from published or deployed.','/build-feedback'),
  requirement('hf','Hugging Face model access','Please configure a scoped HF_TOKEN through your execution environment’s secret manager, and confirm the selected model/provider access and allowed budget. Do not send the token in chat.','Read the exact model card. Verify permissions, runtime/hardware or provider quota and perform only an authorized small trial. Public metadata search needs no token.','/agent-start','huggingface'),
  requirement('envato','Envato assets / editor','Please sign into Envato in a browser this agent can access, and confirm the selected asset/license or generation model and credit budget. Do not share passwords or cookies.','Open the chosen asset/editor, verify entitlement and project license evidence. An Envato catalog entry is not an API connection.','/agent-start','envato'),
  requirement('audio','Voice, music or sound generation','Which audio provider or local model should we use? Please configure any required key privately and confirm the voice/model, hardware and budget.','Read the audio skill; verify the exact provider or local runtime and audition a short sample before a full generation.','/skills?category=audio','audio'),
 ];
 const enabledProviders=['huggingface','envato','audio'].filter(provider=>provider==='huggingface'?/hugging\s?face|hf_token/i.test(context):provider==='audio'?/voice|music generation|audio generation/i.test(context):/envato/i.test(context));
 return {engine:guide.name,engineId:engine,requirements,enabledProviders,
  agentInstructions:'Before implementing, ask the user the unresolved setup questions below in concise batches. Honor answers and authorization already supplied. Ask them to perform sign-in or configure secrets in their own environment; never request passwords, tokens or cookie exports in chat or commit them. Explain the feature blocked by each missing item and offer a suitable no-service fallback. Continue independent work; do not silently bypass a required dependency. Treat all wizard status selections as user-reported, not verified. Read the recommended skills, inspect the foundation, then record actual checks and a small acceptance trial in BUILD_PLAN.md before expensive work.'};
}
