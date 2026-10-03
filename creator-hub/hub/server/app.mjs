import { fileURLToPath } from 'node:url';
import {createContestMetrics} from './contestMetrics.mjs';
import {createCommunityContent} from './communityContent.mjs';
import {createProjectChat} from './projectChat.mjs';
import {createMarketingCalendar, localCalendarRequest} from './marketingCalendar.mjs';
import {createGrowthRouter} from './growth.mjs';
import {STUDIO_RECIPES, STUDIO_STAGES} from '../shared/studio.mjs';
import {rollToolkit} from './buildBlueprints.mjs';
import {dailyTriviaRouter} from './dailyTrivia.mjs';
import {createBlobDailyTrivia} from './dailyTriviaBlob.mjs';
import {buildToolkit} from './buildToolkit.mjs';
import {editions as journalEditions} from './challenges.mjs';
import {publishedArticles,launch,journalHtml,journalFeed} from './journal.mjs';
import {subscriptionConfiguration,createSubscriptionHandler} from './subscriptions.mjs';
import {weeklyIdeas} from './creatorIdeas.mjs';
import {monitoringStatus} from './sourceMonitoring.mjs';
import {createLearningLoop} from './learningLoop.mjs';
import {createBuildBudgets} from './buildBudgets.mjs';
import {agentStart, agentResourceIndex, agentSkillBundle} from './agentResources.mjs';
import {publicDocument, publicDocumentIndex, publicRoleIndex, publicRoleMarkdown} from './agentDocs.mjs';
import {createHuggingFaceSearch} from './huggingface.mjs';
import {createCreatorAnalytics} from './creatorAnalytics.mjs';
import {runtimeDir} from './paths.mjs';
import {createChallenges} from './challenges.mjs';
import {createCommunityLearning,learningStandard} from './communityLearning.mjs';
import {createSkillMarket} from './skillMarket.mjs';
import * as assets from './assets.mjs';
import { gameLibrary } from './gameLibrary.mjs';
import express from 'express';
import { skillCatalog, skillMarkdown, verifiedRouter, pinnedMarkdown, skillSupport } from './skills.mjs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as catalog from './catalog.mjs';
import * as projects from './projects.mjs';
import {llmsText, llmsFullText} from './llmsText.mjs';
import {buildOpenApi} from './contract/openapi.mjs';
import * as engagement from './engagement.mjs';
import * as collectiveChat from './collectiveChat.mjs';
import { createCommunityChat } from './communityChat.mjs';
import * as recipes from './recipes.mjs';
import * as videoTemplates from './videoTemplates.mjs';
import { STANDARD } from './popularity.mjs';
import { clientDist, clientPublic, previewsDir, seedPreviewsDir } from './paths.mjs';
import { agentGuideFallbackHtml, agentGuideHtml, withAgentGuideLink } from './agentShell.mjs';

export function createApp() {
  const app = express();
  // Point any client at the agent entry point and the machine-readable contract (RFC 8631).
  app.use((req, res, next) => {
    res.set('Link', '</llms.txt>; rel="describedby"; type="text/plain", </openapi.json>; rel="service-desc"; type="application/json"');
    next();
  });
  app.use('/calendar/draft', (req, res, next) => {
    if (!localCalendarRequest(req)) return res.status(403).send('Marketing calendar requires local access.');
    res.set('Cache-Control', 'no-store');
    next();
  }, express.static(new URL('../../../calendar/', import.meta.url).pathname, {dotfiles:'deny'}));
  app.use('/growth-export', express.static(fileURLToPath(new URL('../../../metrics/', import.meta.url)), { dotfiles: 'deny', index: false }));
  app.get('/game-shared/assetCommerce.mjs',(req,res)=>res.type('application/javascript').send(readFileSync(new URL('../shared/assetCommerce.mjs',import.meta.url),'utf8')));

  const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
    res.status(e.status || 500).json({ error: e.message || 'Server error' });
  });

  // The larger parser applies only to this bounded upload route.
  app.post('/api/assets', express.json({limit:'14mb'}), wrap((req,res)=>res.status(201).json(assets.upload(req.body))));
  app.use(express.json({limit:'256kb'}));
  const api = express.Router();
  const communityContent = createCommunityContent();
  api.get('/community-content', wrap(async (req, res) => {
    res.set('Cache-Control', 'public, max-age=60').json(await communityContent());
  }));
  const contestMetrics = createContestMetrics();
  api.get('/contests/september-2026/metrics', wrap(async (req, res) => {
    res.set('Cache-Control', 'public, max-age=300').json(await contestMetrics());
  }));
  const marketingCalendar = createMarketingCalendar();
  api.get('/marketing-calendar', wrap(async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!localCalendarRequest(req)) return res.status(403).json({error: 'Marketing calendar requires local access.'});
    res.json(await marketingCalendar());
  }));
  const triviaGame=process.env.TRIVIA_STORAGE==='blob'
    ? createBlobDailyTrivia({token:process.env.BLOB_READ_WRITE_TOKEN}) : undefined;
  api.use('/daily-trivia',dailyTriviaRouter(runtimeDir,{publicOrigin:process.env.PUBLIC_SITE_URL,game:triviaGame}));
  api.use('/growth', createGrowthRouter());
  api.get('/journal', (req,res)=>res.json({articles:publishedArticles(),origin:publicOrigin,calendar:journalEditions().filter(item=>item.phase!=='archive').slice(0,2)}));
  api.get('/launch', (req,res)=>res.json(launch));
  api.get('/subscriptions/config', (req,res)=>res.set('Cache-Control','no-store').json(subscriptionConfiguration()));
  api.post('/subscriptions', createSubscriptionHandler());
  const publicOrigin = process.env.PUBLIC_SITE_URL?.replace(/\/$/,'') || '';
  app.get('/blog/feed.xml', (req,res)=> {
    if(!publicOrigin) return res.status(503).type('text/plain').send('Feed available when PUBLIC_SITE_URL is configured.');
    res.type('application/rss+xml').send(journalFeed(publicOrigin));
  });
  app.get('/blog/sitemap.xml', (req,res)=> {
    if(!publicOrigin) return res.status(503).type('text/plain').send('Sitemap available when PUBLIC_SITE_URL is configured.');
    res.type('application/xml').send('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+publishedArticles().map(article=>`<url><loc>${publicOrigin}/blog/${article.slug}</loc><lastmod>${article.updatedAt}</lastmod></url>`).join('')+'</urlset>');
  });
  app.get(['/blog','/blog/:slug'], (req,res,next)=> {
    if(!existsSync(path.join(clientDist,'index.html')))return next();
    const article=req.params.slug?publishedArticles().find(post=>post.slug===req.params.slug):null;
    if(req.params.slug&&!article)return res.status(404).type('text/plain').send('Article not found');
    res.type('html').send(journalHtml(withAgentGuideLink(readFileSync(path.join(clientDist,'index.html'),'utf8')),article,publicOrigin));
  });
  app.get('/api/source-monitoring', (req,res)=>res.json(monitoringStatus()));
  app.get('/agent-start', wrap((req, res) => res.type('html').send(agentGuideHtml(agentStart()))));
  app.get('/agent-start.md', wrap((req, res) => res.type('text/markdown').send(agentStart())));
  api.get('/agent-docs', wrap((req, res) => res.json(publicDocumentIndex())));
  api.get('/agent-roles', wrap((req, res) => res.json(publicRoleIndex())));
  app.get('/agent-roles/:id.md', wrap((req, res) => {
    const body = publicRoleMarkdown(req.params.id);
    if (!body) return res.status(404).type('text/plain').send('Public role not found');
    res.set('X-Content-Type-Options', 'nosniff').type('text/markdown').send(body);
  }));
  app.get('/agent-docs/*', wrap((req, res) => {
    const document = publicDocument(req.params[0]);
    if (!document) return res.status(404).type('text/plain').send('Public document not found');
    res.set('X-Content-Type-Options', 'nosniff').set('ETag', `"${document.sha256}"`).type(document.contentType).send(document.body);
  }));
  app.get('/llms.txt', (req, res) => res.set('Cache-Control', 'public, max-age=300').type('text/plain').send(llmsText()));
  app.get('/llms-full.txt', (req, res) => res.set('Cache-Control', 'public, max-age=300').type('text/plain').send(llmsFullText()));
  const contract = JSON.stringify(buildOpenApi());
  app.get('/openapi.json', (req, res) => res.set('Cache-Control', 'public, max-age=300').type('application/json').send(contract));
  app.get('/play', (req, res) => res.redirect(301, '/games'));
  api.get('/build-toolkit/roll',wrap(async (req,res)=>res.set('Cache-Control','no-store').json(rollToolkit(catalog.all(),req.query,undefined,projects.list()))));
  api.get('/build-toolkit', wrap(async (req,res)=>res.json(buildToolkit(catalog.all(),req.query,{projects:projects.list()}))));
  api.get('/agent-resources', wrap((req, res) => res.json(agentResourceIndex(req.query))));
  app.get('/agent-skills/:id/bundle.json', wrap((req, res) => {
    const bundle = agentSkillBundle(req.params.id);
    if (!bundle) return res.status(404).json({error: 'Bundled skill not found'});
    res.json(bundle);
  }));
  app.get('/agent-skills/:id/*', wrap((req, res) => {
    const bundle = agentSkillBundle(req.params.id);
    const name = req.params[0];
    if (!bundle || !Object.hasOwn(bundle.files, name)) return res.status(404).type('text/plain').send('Skill file not found');
    res.set('X-Content-Type-Options', 'nosniff').type(name.endsWith('.md') ? 'text/markdown' : 'text/plain').send(bundle.files[name]);
  }));
  const searchHuggingFace = createHuggingFaceSearch();
  api.get('/huggingface/search', wrap(async (req, res) => res.json(await searchHuggingFace(req.query))));
  const creatorAnalytics=createCreatorAnalytics(runtimeDir);
  api.post('/creator-analytics/events',wrap((req,res)=>res.json(creatorAnalytics.record(req.body))));
  api.post('/creator-analytics/clear',wrap((req,res)=>res.json(creatorAnalytics.clearHistory(req.body?.sessions))));
  api.get('/creator-analytics',wrap((req,res)=>res.json(creatorAnalytics.summary())));
  api.get('/assets',wrap((req,res)=>res.json(assets.assetSearch(catalog.all(),req.query))));
  api.put('/assets/:id/commerce',wrap((req,res)=>res.json(assets.saveCommerce(req.params.id,req.body))));
  api.get('/assets/:id/commerce',wrap((req,res)=>{const draft=assets.commerceManifest(req.params.id);if(!draft)return res.status(404).json({error:'Uploaded asset not found'});res.attachment(`${req.params.id}-ootle-plan.json`).json(draft);}));
  api.get('/assets/:id/file',wrap((req,res)=>{
    const item=assets.download(req.params.id);if(!item)return res.status(404).json({error:'Asset not found'});
    res.set({'Content-Type':'application/octet-stream','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox"});
    res.download(item.file,item.record.filename);
  }));

  api.get('/workflows/comfy-example', wrap((req,res) => res.json(JSON.parse(readFileSync(new URL('../../video-templates/comfyui/tari-concept-broll.api.json',import.meta.url),'utf8')))));
  api.get('/workflows/agent-guide', wrap((req,res) => res.type('text/markdown').send(readFileSync(new URL('../../WORKFLOW_AGENT_GUIDE.md',import.meta.url),'utf8'))));

  api.get('/creator-ideas', wrap((req,res) => res.set('Cache-Control','no-store').json(weeklyIdeas())));

  api.get('/health', (req, res) => res.json({ ok: true, service: 'tari-creator-hub' }));

  api.get('/game-starters', wrap((req, res) => res.json(gameLibrary(catalog.all().map(catalog.decorate)))));

  api.get('/meta', (req, res) => res.json(catalog.meta()));
  api.get('/sources', (req, res) => res.json({ sources: catalog.sources() }));

  api.get('/resources', wrap((req, res) => {
    const { q, type, ecosystem, readiness, tag, sort } = req.query;
    const params = { q, type, ecosystem, readiness, tag, sort };
    if (req.query.native === 'true') params.native = true;
    if (req.query.native === 'false') params.native = false;
    if (req.query.verified === 'true') params.verified = true;
    const items = catalog.search(params);
    res.json({ count: items.length, facets: catalog.facets(items), items });
  }));

  api.get('/popularity-standard', (req, res) => res.json(STANDARD));

  api.get('/resources/:id', wrap((req, res) => {
    const r = catalog.get(req.params.id);
    if (!r) return res.status(404).json({ error: 'resource not found' });
    res.json(r);
  }));

  api.get('/collections', wrap((req, res) => res.json({ collections: catalog.collections() })));

  // Education / Learn section (CH-021): learn-type records grouped by creator goal.
  api.get('/learn', wrap((req, res) => {
    const { q, topic, level, format, ecosystem } = req.query;
    res.json(catalog.learn({ q, topic, level, format, ecosystem }));
  }));

  api.get('/onboarding', wrap((req, res) => res.json({ paths: catalog.onboarding() })));
  api.get('/onboarding/:id', wrap((req, res) => {
    const p = catalog.onboarding(req.params.id);
    if (!p) return res.status(404).json({ error: 'path not found' });
    res.json(p);
  }));

  // Recipes (CH-025) — versioned composable recipes with typed config validation.
  api.get('/recipes', wrap((req, res) => res.json({ recipes: recipes.recipeSummaries() })));
  api.get('/recipes/:id', wrap((req, res) => {
    const r = recipes.recipeById(req.params.id);
    if (!r) return res.status(404).json({ error: 'recipe not found' });
    // Resolve contextual education via shared canonical resource IDs (CH-022).
    const education = (r.education || []).map((id) => {
      const rec = catalog.get(id);
      return rec ? { id: rec.id, title: rec.title, url: rec.sourceUrl || rec.docsUrl, topic: rec.topic } : { id, title: id, url: null, missing: true };
    });
    res.json({ ...r, education });
  }));
  api.post('/recipes/:id/validate', wrap((req, res) => {
    const r = recipes.recipeById(req.params.id);
    if (!r) return res.status(404).json({ error: 'recipe not found' });
    res.json(recipes.validateConfig(r, Object.hasOwn(req.body || {}, 'config') ? req.body.config : {}));
  }));
  api.post('/recipes/:id/export', wrap((req, res) => {
    const r = recipes.recipeById(req.params.id);
    if (!r) return res.status(404).json({ error: 'recipe not found' });
    try {
      res.json(recipes.exportManifest(r, Object.hasOwn(req.body || {}, 'config') ? req.body.config : {}));
    } catch (e) {
      res.status(e.status || 400).json({ error: e.message, errors: e.errors || [] });
    }
  }));

  // Make a video (CH-026) — configure a Remotion template, validate, export props.
  api.get('/video/templates', wrap((req, res) => res.json({ templates: videoTemplates.videoTemplateSummaries() })));
  api.get('/video/templates/:id', wrap((req, res) => {
    const t = videoTemplates.templateById(req.params.id);
    if (!t) return res.status(404).json({ error: 'template not found' });
    res.json(t);
  }));
  api.post('/video/templates/:id/validate', wrap((req, res) => {
    const t = videoTemplates.templateById(req.params.id);
    if (!t) return res.status(404).json({ error: 'template not found' });
    res.json(videoTemplates.validateConfig(t, Object.hasOwn(req.body || {}, 'config') ? req.body.config : {}));
  }));
  api.post('/video/templates/:id/export', wrap((req, res) => {
    const t = videoTemplates.templateById(req.params.id);
    if (!t) return res.status(404).json({ error: 'template not found' });
    try {
      res.json(videoTemplates.exportManifest(t, Object.hasOwn(req.body || {}, 'config') ? req.body.config : {}));
    } catch (e) {
      res.status(e.status || 400).json({ error: e.message, errors: e.errors || [] });
    }
  }));
  // Optional OpenMontage-style brief -> draft copy (uses HUGGINGFACE_TOKEN).
  api.post('/video/templates/:id/draft', wrap(async (req, res) => {
    const t = videoTemplates.templateById(req.params.id);
    if (!t) return res.status(404).json({ error: 'template not found' });
    const brief = (req.body && req.body.brief) || '';
    if (typeof brief !== 'string' || !brief.trim() || brief.length > 4000) return res.status(400).json({ error: 'brief must be 1-4000 characters' });
    try {
      res.json(await videoTemplates.draftFromBrief(t, brief));
    } catch (e) {
      res.status(e.status || 502).json({ error: e.message });
    }
  }));

  // Save a server-validated recipe snapshot into the existing versioned project store.
  api.post('/recipes/:id/projects', wrap(async (req, res) => {
    const recipe = recipes.recipeById(req.params.id);
    if (!recipe) return res.status(404).json({error:'recipe not found'});
    const {config, title, description, author} = req.body || {};
    const manifest = recipes.exportManifest(recipe, config);
    const out = await projects.create({title, description, author: author ? {name:author}:undefined,
      ecosystem:'tari-ootle', templateId: recipe.components[0].templateId,
      components: [], recipe:manifest});
    res.set('Cache-Control','no-store').status(201).json(out);
  }));

  api.get('/studio/recipes', (_req,res) => res.json({version:1,execution:'design-only',recipes:STUDIO_RECIPES,stages:STUDIO_STAGES}));

  // Projects — git-backed publish, versions, fork.
  // No games are published after the fresh start; keep the shape so clients render an empty state.
  api.get('/games', (req, res) => res.set('Cache-Control','no-store').json({ originals: [], remixes: [] }));
  api.get('/projects', wrap((req, res) => res.json({ projects: projects.list() })));
  api.post('/projects', wrap(async (req, res) => {
    const { title, description, templateId, ecosystem, author, components, workflow, setupPlan } = req.body || {};
    const out = await projects.create({ title, description, templateId, ecosystem, author: author ? { name: author } : undefined, components, workflow, setupPlan });
    res.set('Cache-Control','no-store').status(201).json(out);
  }));
  api.get('/projects/:id', wrap(async (req, res) => {
    const d = await projects.detail(req.params.id);
    if (!d) return res.status(404).json({ error: 'project not found' });
    res.json(d);
  }));
  api.post('/projects/:id/publish', wrap(async (req, res) => {
    const { state, message, author, expectedHead } = req.body || {};
    const out = await projects.publish(req.params.id, { state: state || {}, message, author: author ? { name: author } : undefined, expectedHead });
    res.json(out);
  }));
  api.post('/projects/:id/manage-history',wrap(async(req,res)=>res.set('Cache-Control','no-store').json(await projects.manageHistory(req.params.id,req.body,req.get('authorization')?.replace(/^Bearer /,'')))));
  api.get('/projects/:id/versions', wrap(async (req, res) => res.json({ versions: await projects.versions(req.params.id) })));
  api.get('/projects/:id/state', wrap(async (req, res) => res.json(await projects.stateAt(req.params.id, req.query.ref || 'HEAD'))));
  api.post('/projects/:id/fork', wrap(async (req, res) => {
    const { fromRef, title, author } = req.body || {};
    const out = await projects.fork(req.params.id, { fromRef, title, author: author ? { name: author } : undefined });
    res.set('Cache-Control','no-store').status(201).json(out);
  }));

  // Engagement — stars/likes and comments for resources and projects.
  api.get('/engagement/:kind/:id', wrap((req, res) => {
    res.json(engagement.state(req.params.kind, req.params.id, req.query.user));
  }));
  api.post('/engagement/:kind/:id/star', wrap((req, res) => {
    const user = (req.body && req.body.user) || req.query.user;
    res.json(engagement.toggleStar(req.params.kind, req.params.id, user));
  }));
  api.post('/engagement/:kind/:id/comments', wrap((req, res) => {
    const { author, body } = req.body || {};
    res.status(201).json(engagement.addComment(req.params.kind, req.params.id, { author, body }));
  }));

  // Collective chat Slice 1 — shared project room (lobby-collective).
  api.get('/collective-chat/rooms/:roomId', wrap((req, res) => {
    res.set('Cache-Control', 'no-store').json(collectiveChat.getRoom(req.params.roomId));
  }));
  api.post('/collective-chat/rooms/:roomId/messages', wrap((req, res) => {
    const body = req.body || {};
    res.set('Cache-Control', 'no-store').status(201).json(collectiveChat.addMessage(req.params.roomId, body));
  }));
  api.patch('/collective-chat/rooms/:roomId/messages/:messageId', wrap((req, res) => {
    res.set('Cache-Control', 'no-store').json(
      collectiveChat.patchMessageState(req.params.roomId, req.params.messageId, req.body?.clientState),
    );
  }));

  // Community chat — public text room for players and creators (see agents/chat/community-chat-rules.md).
  const communityChat = createCommunityChat();
  const bearerToken = (req) => req.get('authorization')?.replace(/^Bearer /, '') || '';
  // Like wrap(), plus the rejection code; sync throws also become JSON errors.
  const communityRoute = (handler) => async (req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      await handler(req, res);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message || 'Server error', code: error.code });
    }
  };
  const projectChat = createProjectChat();
  api.get('/project-chat/rooms', communityRoute((req, res) => res.json(projectChat.listRooms())));
  api.post('/project-chat/rooms', communityRoute((req, res) => res.status(201).json(projectChat.createRoom(req.body, {ip: req.ip}))));
  api.get('/project-chat/rooms/:roomId/messages', communityRoute((req, res) => res.json(projectChat.listMessages(req.params.roomId))));
  api.post('/project-chat/rooms/:roomId/messages', communityRoute((req, res) => res.status(201).json(projectChat.postMessage(req.params.roomId, req.body, {ip: req.ip}))));
  api.post('/project-chat/rooms/:roomId/report', communityRoute((req, res) => res.json(projectChat.reportRoom(req.params.roomId, req.body))));
  api.post('/project-chat/rooms/:roomId/messages/:messageId/report', communityRoute((req, res) => res.json(projectChat.reportMessage(req.params.roomId, req.params.messageId, req.body))));
  api.get('/community-chat/messages', communityRoute((req, res) => {
    const after = typeof req.query.after === 'string' ? req.query.after : undefined;
    res.json(communityChat.listMessages({ after }));
  }));
  api.post('/community-chat/messages', communityRoute((req, res) => {
    res.status(201).json(communityChat.postMessage(req.body || {}, { ip: req.ip }));
  }));
  api.post('/community-chat/messages/:messageId/report', communityRoute((req, res) => {
    res.json(communityChat.reportMessage(req.params.messageId, req.body || {}));
  }));
  api.get('/community-chat/moderation', communityRoute((req, res) => {
    res.json(communityChat.moderationQueue(bearerToken(req)));
  }));
  api.post('/community-chat/messages/:messageId/moderate', communityRoute((req, res) => {
    res.json(communityChat.moderateMessage(req.params.messageId, req.body || {}, bearerToken(req)));
  }));

  const market=createSkillMarket();
  const challenges=createChallenges();
  api.get('/challenges',wrap((req,res)=>res.json({editions:challenges.list(),mode:'local-pilot'})));
  api.get('/challenges/submissions',wrap((req,res)=>res.json({submissions:challenges.submissions()})));
  api.post('/challenges/submissions',wrap(async(req,res)=>{
    const creator=market.authenticate(req.body?.creatorId,req.get('authorization')?.replace(/^Bearer /,''));
    const project=await projects.detail(req.body?.projectId);
    res.status(201).json(challenges.submit(req.body,creator,project));
  }));
  api.get('/learn/submission-standard',wrap(async(req,res)=>res.json(learningStandard)));
  api.post('/learn/resources',wrap(async(req,res)=>{
    const creator=market.authenticate(req.body?.creatorId,req.get('authorization')?.replace(/^Bearer /,''));
    const record=createCommunityLearning().add(req.body,creator,catalog.all());
    res.status(201).json(record);
  }));
  const lessons=createLearningLoop();
  app.get('/learning-loop.md',wrap(async (req,res)=>res.type('text/markdown').send(readFileSync(new URL('../../../.agents/skills/creator-learning-loop/references/api.md',import.meta.url),'utf8'))));
  api.get('/learning/published',wrap(async (req,res)=>res.json({items:lessons.publicListings()})));
  const lessonOwner=(req)=>market.authenticate(req.method==='GET'?req.query.creatorId:req.body?.creatorId,req.get('authorization')?.replace(/^Bearer /,''));
  api.get('/learning/lessons',wrap(async (req,res)=>{
    res.set('Cache-Control','no-store');
    const owner=lessonOwner(req);
    res.json({items:lessons.list(owner.id,req.query.projectId)});
  }));
  api.post('/learning/lessons',wrap(async (req,res)=>{
    res.set('Cache-Control','no-store');
    const owner=lessonOwner(req);
    if (!projects.isValidId(req.body.projectId)) return res.status(404).json({error:'Choose an existing project'});
    const project=await projects.detail(req.body.projectId);
    if (!project) return res.status(404).json({error:'Choose an existing project'});
    res.status(201).json(lessons.create(owner.id,{...req.body,projectRevision:project.head}));
  }));
  for (const action of ['edit','review','trial','publish','reject','retire']) {
    api.post(`/learning/lessons/:id/${action}`,wrap(async (req,res)=>{
      res.set('Cache-Control','no-store');
      const owner=lessonOwner(req);
      res.json(lessons[action](req.params.id,owner.id,req.body));
    }));
  }
  api.get('/skill-market', wrap(async (req,res)=>res.json(market.catalog())));
  const buildBudgets=createBuildBudgets();
  api.get('/build-budgets',wrap(async(req,res)=>{
    res.set('Cache-Control','no-store');
    res.json({items:buildBudgets.list(market.catalog().creators)});
  }));
  api.post('/build-budgets',wrap(async(req,res)=>{
    const owner=lessonOwner(req);
    if(!owner.showWork||!owner.showActivity)return res.status(400).json({error:'Enable portfolio and activity visibility in your profile to join this board'});
    res.status(201).json(buildBudgets.submit(owner.id,req.body));
  }));
  for(const action of ['recommend','withdraw'])api.post(`/build-budgets/:id/${action}`,wrap(async(req,res)=>{
    const owner=lessonOwner(req);
    if(action==='recommend'&&(!owner.showWork||!owner.showActivity))return res.status(400).json({error:'Enable portfolio and activity visibility to recommend builds'});
    res.json(buildBudgets[action](req.params.id,owner.id,req.body));
  }));
  api.post('/creator-profiles', wrap(async (req,res)=>res.status(201).json(market.profile(req.body))));
  api.put('/creator-profiles/:id', wrap(async (req,res)=>res.json(market.update(req.params.id,req.body,req.get('authorization')?.replace(/^Bearer /,'')))));
  api.post('/skill-market', wrap(async (req,res)=>res.status(201).json(market.publish(req.body,req.get('authorization')?.replace(/^Bearer /,'')))));
  api.post('/skill-market/:id/download', wrap(async (req,res)=>res.json(market.download(req.params.id,req.body.visitor))));
  api.get('/skills', wrap((req, res) => res.json({ skills: skillCatalog() })));
  api.get('/skills/:slug', wrap((req, res) => {
    const metadata=skillCatalog().find(m=>m.id===req.params.slug);
    if(!metadata)return res.status(404).json({error:'skill not found'});
    res.json({metadata, markdown:skillMarkdown(req.params.slug)});
  }));
  app.get('/skills/SKILL.md', wrap((req,res)=>res.type('text/markdown').send(verifiedRouter())));
  app.get('/skills/:slug/SKILL.md', wrap((req,res)=>{
    const text=skillMarkdown(req.params.slug);
    if(text===null)return res.status(404).type('text/plain').send('Skill not found');
    res.type('text/markdown').send(text);
  }));
  app.get('/skills/revisions/:ref/:slug/SKILL.md', wrap((req,res)=>{
    const text=pinnedMarkdown(req.params.ref,req.params.slug);
    if(text===null)return res.status(404).type('text/plain').send('Pinned skill not found');
    res.set('Cache-Control','public, max-age=31536000, immutable').type('text/markdown').send(text);
  }));
  app.get(/^\/skills\/(.+\.(?:json|mjs|py|rs|toml|lock))$/, wrap((req,res)=>{
    const text=skillSupport(req.params[0]);
    if(text===null)return res.status(404).type('text/plain').send('Skill resource not found');
    res.type(req.params[0].endsWith('.json')?'application/json':'text/plain').send(text);
  }));
  app.use('/api', api);

  // App previews, served read-only: runtime captures/covers first, then the
  // committed cover-poster seed as a fallback so fresh instances show thumbnails.
  app.use('/previews', express.static(previewsDir, { maxAge: 0, index:false }));
  app.use('/previews', express.static(seedPreviewsDir, { maxAge: '1h', index:false }));

  // Serve the built client (if present) with SPA fallback.
  // Prefer dist, then committed client/public (vite publicDir) so KeepAlive or a
  // stale dist cannot SPA-fallback vault-disc SVG/PNG to text/html.
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false }));
    if (existsSync(clientPublic)) {
      app.use(express.static(clientPublic, { index: false }));
    }
    app.get(/^(?!\/(api|previews)).*/, (req, res) => {
      // Asset-looking paths must never become index.html (HTML@SVG regress).
      if (/\.[a-z0-9]{1,8}$/i.test(req.path) && !/\.html?$/i.test(req.path)) {
        return res.status(404).type('text/plain').send('Not found');
      }
      const shell = withAgentGuideLink(readFileSync(path.join(clientDist, 'index.html'), 'utf8'));
      res.type('html').send(shell);
    });
  } else {
    if (existsSync(clientPublic)) {
      app.use(express.static(clientPublic, { index: false }));
    }
    app.get('/', (req, res) => res.type('html').send(agentGuideFallbackHtml()));
    app.get(/^(?!\/(api|previews)).*/, (req, res) => {
      if (/\.[a-z0-9]{1,8}$/i.test(req.path) && !/\.html?$/i.test(req.path)) {
        return res.status(404).type('text/plain').send('Not found');
      }
      res.status(404).type('text/plain').send('Not found');
    });
  }

  return app;
}
