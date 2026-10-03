import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {importPreviewLibrary} from '../../scripts/import-preview-library.mjs';

test('library import preserves review, refuses altered covers and keeps unrelated destination entries',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'media-import-'));
 const source=path.join(root,'source'), destination=path.join(root,'destination');
 mkdirSync(source);mkdirSync(destination);
 try {
  const bytes=Buffer.from('reviewed fixture');
  writeFileSync(path.join(source,'cover.mp4'),bytes);
  const entry={id:'resource:one',source:'cover',video:'/previews/cover.mp4',review:{policyVersion:1,resourceId:'resource:one',faithfulToSource:true,uniqueVisual:true,reviewer:'test reviewer',reviewedAt:'2026-09-22',sceneDescription:'Distinct scene conveying the resource purpose and its mechanism.',references:['https://example.com'],videoSha256:createHash('sha256').update(bytes).digest('hex')}};
  writeFileSync(path.join(source,'catalog-index.json'),JSON.stringify([entry,{id:'retired',source:'cover',video:entry.video}]));
  writeFileSync(path.join(destination,'catalog-index.json'),JSON.stringify([{id:'existing',source:'capture',video:'/previews/existing.mp4'}]));
  assert.equal(importPreviewLibrary(source,destination).imported,1);
  const restored=JSON.parse(readFileSync(path.join(destination,'catalog-index.json')));
  assert.equal(restored.length,2);
  assert.deepEqual(restored[1].review,entry.review);
  assert.match(restored[1].video,/media-[a-f0-9]{64}\.mp4$/);
  assert.deepEqual(readFileSync(path.join(destination,path.basename(restored[1].video))),bytes);
  writeFileSync(path.join(source,'cover.mp4'),'tampered');
  assert.equal(importPreviewLibrary(source,destination).imported,0);
  assert.deepEqual(JSON.parse(readFileSync(path.join(destination,'catalog-index.json'))),restored);
 } finally {rmSync(root,{recursive:true,force:true});}
});
