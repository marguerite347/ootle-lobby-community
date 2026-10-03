#!/usr/bin/env node
// Generic cover generation is retired. Report the queue without fabricating visuals.
import {load,search} from '../../hub/server/catalog.mjs';
load();
const missing=search().filter(r=>!r.preview?.video);
console.log(JSON.stringify({policy:'creator-hub/VIDEO_PREVIEW_POLICY.md',action:'Author bespoke animated album artwork about each resource, with distinct concept, composition, imagery and motion. UI replication is optional; generic reskins are prohibited.',pending:missing.map(r=>({id:r.id,title:r.title,type:r.type,source:r.demoUrl||r.docsUrl||r.repoUrl||r.sourceUrl,hasOriginalImage:!!r.preview?.image}))},null,2));
