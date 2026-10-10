import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readCommunityProjects} from '../creator-hub/hub/shared/readCommunityProjects.mjs';
import {validateCommunityProjects} from '../creator-hub/hub/shared/communityProjects.mjs';
const projects=readCommunityProjects(new URL('../',import.meta.url));
test('reviewed community media is committed and matches its recorded digest',()=>{
 assert.ok(projects.some(p=>p.section==='official'));assert.ok(projects.some(p=>p.slug==='liquidity'));
 for(const p of projects){
  if(p.media===null)continue; // Source-only listings explicitly allow no recording.
  const bytes=readFileSync(new URL(`../creator-hub/hub/data/seed${p.media.video}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),p.media.sha256);
  assert.ok(readFileSync(new URL(`../creator-hub/hub/data/seed${p.media.image}`,import.meta.url)).length>100);
 }
});
test('rejects unsafe content, arbitrary API targets, unreviewed media and duplicate repos',()=>{
 for(const change of [p=>p.repoUrl='https://localhost/repo',p=>p.sourceUrl='javascript:alert(1)',p=>p.media.video='https://example.com/unknown.mp4',p=>p.media.sha256='',p=>p.forum={url:'https://other.com/210',topicId:210,postNumber:1,scope:'topic'},p=>p.summary='<script>',p=>p.technologies[0].sourceUrl='http://example.com']){
  const p=structuredClone(projects.find(p=>p.slug==='liquidity'));change(p);assert.throws(()=>validateCommunityProjects([p]));
 }
 assert.throws(()=>validateCommunityProjects([projects.find(p=>p.slug==='liquidity'),{...projects.find(p=>p.slug==='liquidity'),slug:'duplicate'}]));
});

test('official status requires both an official site and official repository',()=>{
 const original=projects.find(p=>p.section==='official');
 for(const change of [p=>p.repoUrl='https://github.com/community/project',p=>p.officialSource='https://tari.example.com/']){const p=structuredClone(original);change(p);assert.throws(()=>validateCommunityProjects([p]));}
});
