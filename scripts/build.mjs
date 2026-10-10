import {readCommunityProjects} from '../creator-hub/hub/shared/readCommunityProjects.mjs';
import {readFileSync, readdirSync, mkdirSync, writeFileSync, lstatSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validateProjects, validateFeed} from '../lib/content.mjs';

import {readContestContent} from '../creator-hub/hub/shared/readContestContent.mjs';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('content/manifest.json', root), 'utf8'));
const directory = new URL('content/projects/', root);
const files = readdirSync(directory).sort();
if (JSON.stringify(files) !== JSON.stringify(manifest.map(project => `${project.slug}.json`).sort())) throw new Error('Project files must match the reviewed manifest.');
const projects = files.map(file => {
  const path = new URL(file, directory);
  if (lstatSync(path).isSymbolicLink() || lstatSync(path).size > 20000) throw new Error('Content must be small JSON files, not symbolic links.');
  const project = JSON.parse(readFileSync(path, 'utf8'));
  if (project.id !== manifest.find(item => `${item.slug}.json` === file)?.id) throw new Error(`Do not change the project id in ${file}.`);
  return project;
});
validateProjects(projects);
const contests=readContestContent(root);
const communityProjects=readCommunityProjects(root);
const contestRepos=new Set(contests.flatMap(c=>c.entries).map(p=>p.repoUrl?.toLowerCase()).filter(Boolean));
const september=JSON.parse(readFileSync(new URL('creator-hub/hub/data/contests/september-2026.json',root),'utf8'));
for(const p of september.entries)if(p.repoUrl)contestRepos.add(p.repoUrl.toLowerCase());
if(communityProjects.some(p=>p.repoUrl&&contestRepos.has(p.repoUrl.toLowerCase())))throw new Error('Community projects must not duplicate contest entries.');
console.log(`Validated ${projects.length} project records.`);
if (!process.argv.includes('--check')) {
  const revision = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  const feed = validateFeed({schemaVersion: 1, revision, publishedAt: new Date().toISOString(), projects, contests, communityProjects});
  mkdirSync(new URL('dist/', root), {recursive: true});
  writeFileSync(new URL('dist/content.json', root), JSON.stringify(feed, null, 2) + '\n');
  writeFileSync(new URL('dist/index.html', root), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ootle Lobby community content</title><body><h1>Ootle Lobby community content</h1><p>Accepted content for the <a href="https://ootle-lobby-preview.vercel.app">live Lobby</a>.</p><p><a href="https://github.com/marguerite347/ootle-lobby-community">Suggest an edit or review proposals on GitHub</a></p><p><a href="content.json">Published content feed</a></p></body></html>');
}
