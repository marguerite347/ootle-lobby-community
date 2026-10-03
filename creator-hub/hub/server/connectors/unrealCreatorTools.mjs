import {makeResource} from '../model.mjs';

// Curated discovery, not installed integrations or automatic vendor release checks.
const entries = [
  [
    "ludus-ai",
    "Ludus AI",
    "https://ludusengine.com/",
    "workflow",
    "Vendor-described Blueprint generation and project-aware Unreal assistance. Check engine/OS support and account access; not installed or execution-verified."
  ],
  [
    "aura-unreal",
    "Aura \u00b7 Unreal AI setup",
    "https://www.tryaura.dev/documentation",
    "workflow",
    "Official installation and project connection instructions for Aura, including Blueprint workflows. Verify the engine/OS matrix before installing; no Hub connection has been tested."
  ],
  [
    "unreal-copilot",
    "Ultimate Engine CoPilot",
    "https://forums.unrealengine.com/t/ultimate-engine-copilot-the-world-s-most-comprehensive-ai-development-tool-for-unreal-engine/2618922",
    "workflow",
    "Author-listed Unreal plugin for Blueprint and related production workflows. Verify current Fab compatibility and entitlement; vendor claims are not a Hub-tested integration."
  ],
  [
    "fabric-ai",
    "Fabric AI \u00b7 creator demonstration",
    "https://www.youtube.com/watch?v=Vty5dO0Ht1g",
    "learn",
    "Unreal AI demonstration reference. Current installer, supported versions and executable integration have not been verified."
  ],
  [
    "epic-developer-assistant",
    "Epic Developer Assistant",
    "https://dev.epicgames.com/community/assistant/unreal-engine",
    "learn",
    "Official assistant entry point for Unreal questions. Page body was unavailable during review; local Blueprint-editing access is not established."
  ],
  [
    "codegpt-unreal",
    "CodeGPT for Unreal Engine",
    "https://www.codegpt.co/agents/unreal-engine-v5",
    "workflow",
    "External Unreal-oriented coding assistance. Check model account and editor connection; source-code context does not prove direct Blueprint graph editing."
  ],
  [
    "nvidia-unreal-retrieval",
    "NVIDIA \u00b7 Unreal code retrieval workflow",
    "https://developer.nvidia.com/blog/reliable-ai-coding-for-unreal-engine-improving-accuracy-and-reducing-token-costs/",
    "learn",
    "Technical reference for context retrieval in Unreal codebases. Requires a separate indexing/inference setup; not a ready-made Blueprint editor."
  ],
  [
    "elevenlabs-unreal-audio",
    "ElevenLabs \u00b7 Unreal voice prototyping",
    "https://elevenlabs.io/docs/overview",
    "workflow",
    "Voice prototyping resource to pair with Unreal audio workflows. Requires selected provider access and an audition; does not generate gameplay graphs."
  ],
  [
    "aura-walkthrough",
    "Aura gameplay walkthrough \u00b7 supplied reference",
    "https://www.youtube.com/watch?v=7L-uWqKmylM",
    "learn",
    "User-supplied demonstration covering a launchpad, level changes and a turret. Video was not retrievable during review; chapter claims are not independently verified."
  ],
  [
    "uefn-engine-comparison",
    "UEFN versus Unreal Engine",
    "https://dev.epicgames.com/documentation/en-us/fortnite/uefn-vs-ue-in-unreal-editor-for-fortnite",
    "learn",
    "Official comparison: UEFN shares editor tools but custom gameplay uses devices and Verse rather than full Unreal Blueprint visual scripting."
  ],
  [
    "uefn-installation",
    "UEFN \u00b7 Install and launch",
    "https://dev.epicgames.com/documentation/fortnite/install-and-launch-fortnite-creative-and-unreal-editor-for-fortnite",
    "learn",
    "Official Epic setup path for Fortnite and UEFN. Use with the UEFN Creator setup skill; no local session or island publication has been verified."
  ]
];

export const unrealCreatorConnectors = entries.map(([id,title,url,type,summary]) => ({
 source:{id,name:title,kind:'curated',native:false,canonicalUrl:url,ingestion:'Curated Unreal/UEFN reference reviewed 2026-09-23. Manual vendor review; no automatic release monitoring or installed connection.'},
 async fetchLive(){return {records:[makeResource({id:`creative:${type}:${id}`,type,ecosystem:'creative',title,summary,category:'Unreal and UEFN creation',tags:['unreal','creator-tools', ...(id.startsWith('uefn') ? ['uefn','verse','fortnite'] : ['blueprints','ai-tools'])],format:type==='learn'?'guide':'workflow',sourceUrl:url,docsUrl:url,sourceId:id,sourceName:title,readiness:'conceptual',freshness:'provisional',verification:'source-attested',lastVerifiedAt:'2026-09-23'})]};}
}));
