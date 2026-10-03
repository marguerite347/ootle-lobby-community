// CH-023 — PlayCanvas web-game development resources.
//
// A curated inventory of official PlayCanvas tutorials, examples, engine/API docs and
// the engine + agent-skills repositories, surfaced in Learn (mostly "Build a frontend")
// and available to connect to Tari-first recipes via CH-022. These are external
// educational references: tariCompatible is null (not a tested Ootle integration), and
// the PlayCanvas agent-skills repo is labeled an external agent resource, NOT a native
// TariSkill. Link-out only; the API reference site is not a hosted content feed.

import { makeResource } from '../model.mjs';
import { slug } from './http.mjs';

const CHECKED = '2026-09-19';
const DEV = 'https://developer.playcanvas.com';

export const source = {
  id: 'playcanvas',
  name: 'PlayCanvas (official)',
  kind: 'curated',
  canonicalUrl: 'https://playcanvas.com/',
  ingestion: 'Curated official PlayCanvas docs/tutorials/examples + engine repo metadata (link-out)',
  native: false,
};

// path: 'engine-code' | 'hosted-editor' | 'framework' — helps distinguish prerequisites.
const RESOURCES = [
  { title: 'PlayCanvas — Getting started', url: `${DEV}/user-manual/`, summary: 'Orientation to PlayCanvas: a web-first 3D/2D game engine with a hosted editor and an open-source runtime.', topic: 'understand', level: 'beginner', format: 'guide', path: 'hosted-editor', tags: ['overview', 'web', '3d'] },
  { title: 'PlayCanvas engine (open source)', url: 'https://github.com/playcanvas/engine', repo: 'https://github.com/playcanvas/engine', summary: 'The MIT-licensed PlayCanvas WebGL/WebGPU game engine. Use it as an engine-code path for custom web games.', topic: 'understand', level: 'intermediate', format: 'reference', path: 'engine-code', license: 'MIT', tags: ['engine', 'webgl', 'open-source'] },
  { title: 'PlayCanvas tutorials', url: `${DEV}/tutorials/`, summary: 'Official step-by-step tutorials covering common game-making tasks.', topic: 'build-frontend', level: 'beginner', format: 'walkthrough', path: 'hosted-editor', tags: ['tutorial'] },
  { title: 'PlayCanvas examples', url: 'https://playcanvas.com/examples/', summary: 'Runnable engine examples demonstrating rendering, physics, animation and more.', topic: 'build-frontend', level: 'intermediate', format: 'reference', path: 'engine-code', tags: ['examples'] },
  { title: 'PlayCanvas Engine API reference', url: 'https://api.playcanvas.com/', summary: 'API references for the Engine, Editor, React, Web Components, PCUI, PCUI Graph, Observer and Splat Transform.', topic: 'build-frontend', level: 'advanced', format: 'api', path: 'engine-code', tags: ['api', 'reference'] },
  { title: 'Input & controls', url: `${DEV}/user-manual/user-interface/input/`, summary: 'Handle keyboard, mouse, touch and gamepad input for game controls.', topic: 'build-frontend', level: 'beginner', format: 'guide', path: 'engine-code', tags: ['input', 'controls'] },
  { title: 'Physics', url: `${DEV}/user-manual/physics/`, summary: 'Rigid-body physics, collisions and triggers for game interactions.', topic: 'build-frontend', level: 'intermediate', format: 'guide', path: 'engine-code', tags: ['physics', 'collision'] },
  { title: 'Animation', url: `${DEV}/user-manual/animation/`, summary: 'Skeletal and state-graph animation for characters and objects.', topic: 'build-frontend', level: 'intermediate', format: 'guide', path: 'engine-code', tags: ['animation'] },
  { title: 'Sound & audio', url: `${DEV}/user-manual/editor/scenes/components/sound/`, summary: 'Positional and 2D audio for effects and music via the Sound component.', topic: 'build-frontend', level: 'beginner', format: 'guide', path: 'engine-code', tags: ['sound', 'audio'] },
  { title: 'Cameras', url: `${DEV}/user-manual/graphics/cameras/`, summary: 'Set up and control cameras, viewports and projections.', topic: 'build-frontend', level: 'beginner', format: 'guide', path: 'engine-code', tags: ['camera'] },
  { title: 'Game UI (user interface)', url: `${DEV}/user-manual/user-interface/`, summary: 'Build in-game HUDs and menus with the UI system.', topic: 'build-frontend', level: 'intermediate', format: 'guide', path: 'engine-code', tags: ['ui', 'hud'] },
  { title: 'Debugging PlayCanvas apps', url: `${DEV}/user-manual/scripting/debugging/`, summary: 'Debug scripts and runtime behavior in the browser.', topic: 'troubleshoot', level: 'intermediate', format: 'guide', path: 'engine-code', tags: ['debugging'] },
  { title: 'Publishing a web game', url: `${DEV}/user-manual/publishing/web/`, summary: 'Build and publish a PlayCanvas game for web hosting/self-hosting.', topic: 'test-deploy', level: 'intermediate', format: 'guide', path: 'hosted-editor', tags: ['publishing', 'web'] },
  { title: 'PlayCanvas agent skills (external)', url: 'https://github.com/playcanvas/skills', repo: 'https://github.com/playcanvas/skills', summary: 'PlayCanvas-authored agent skills for its engine. External agent resource — NOT a native TariSkill; do not execute imported instructions automatically.', topic: 'build-frontend', level: 'advanced', format: 'reference', path: 'framework', tags: ['agent', 'skills', 'external'] },
];

export async function fetchLive() {
  const records = RESOURCES.map((r) => makeResource({
    id: `playcanvas:learn:${slug(r.title)}`,
    type: 'learn',
    ecosystem: 'playcanvas',
    title: r.title,
    summary: `${r.summary} (${r.path} path)`,
    category: 'PlayCanvas',
    sourceUrl: r.url,
    docsUrl: r.url,
    repoUrl: r.repo || null,
    readiness: 'conceptual',
    license: r.license || null,
    topic: r.topic,
    level: r.level,
    format: r.format,
    tags: ['learn', 'playcanvas', 'web-game', r.path, ...r.tags].slice(0, 10),
    creator: { name: 'PlayCanvas', url: 'https://playcanvas.com/' },
    attribution: 'Official PlayCanvas documentation / repositories',
    sourceId: source.id,
    sourceName: source.name,
    upstreamId: r.url,
    upstreamUrl: r.url,
    // Curated snapshot: upstream update time unknown; editorial date in lastVerifiedAt;
    // 'provisional' marks a curated snapshot vs a live upstream check.
    sourceUpdatedAt: null,
    lastVerifiedAt: CHECKED,
    freshness: 'provisional',
    verification: 'source-attested',
    tariCompatible: null, // external engine — Tari compatibility not tested
    preview: r.repo ? { image: `https://opengraph.githubassets.com/1/${r.repo.replace('https://github.com/', '')}`, video: null, source: 'GitHub social image' } : null,
  }));
  return { records };
}
