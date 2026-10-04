// INTEGRATION_GAP[WB-AUTH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-auth.
// INTEGRATION_GAP[WB-FEED] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-feed.
// INTEGRATION_GAP[WB-PUBLISH] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-publish.
// INTEGRATION_GAP[WB-AI] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-ai.
// INTEGRATION_GAP[WB-DEPLOY] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-deploy.
// INTEGRATION_GAP[WB-RUNNER] (build-required): see docs/DEVELOPMENT_GAPS.md#wb-runner.
import {Router,json} from 'express';

/** Backend seam. Supply authenticated services before advertising a capability.
 * These defaults never execute code, spend funds, or publish client drafts. */
export function createWorkbenchRouter(services={}) {
 const router=Router();
 router.use(json({limit:'3mb'}));
 const capabilities={compile:!!(services.run&&services.getRun),test:!!(services.run&&services.getRun),deploy:!!services.deploy,assistant:!!services.assistant,publish:!!services.publish,publications:!!services.listPublications};
 router.get('/capabilities',(_req,res)=>res.json({version:1,capabilities}));
 const handle=(service)=>async(req,res,next)=>{
  if(!service)return res.status(501).json({code:'NOT_CONNECTED',error:'This workbench service is not connected yet.'});
  try {res.json(await service(req));}catch(error){next(error);}
 };
 router.post('/runs',handle(services.run));
 router.get('/runs/:id',handle(services.getRun));
 router.post('/deployments',handle(services.deploy));
 router.post('/assistant',handle(services.assistant));
 router.post('/publications',handle(services.publish));
 router.get('/publications',services.listPublications?handle(services.listPublications):(_req,res)=>res.json({items:[],connected:false}));
 router.use((_req,res)=>res.status(404).json({error:'Unknown workbench endpoint.'}));
 return router;
}
