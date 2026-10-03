import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { canonicalUrl, slugify, load, previewFor } from '../previews.mjs';

test('canonicalUrl normalizes host + path, ignoring scheme/trailing slash', () => {
  assert.equal(canonicalUrl('https://caravellabs.net/'), 'caravellabs.net');
  assert.equal(canonicalUrl('http://caravellabs.net'), 'caravellabs.net');
  assert.equal(canonicalUrl('https://Universe.Tari.mw/app/'), 'universe.tari.mw/app');
  assert.equal(canonicalUrl('not a url'), null);
});

test('slugify matches the capture/cover file naming', () => {
  assert.equal(slugify('SOOON FUN'), 'sooon-fun');
  assert.equal(slugify('Tari Universe Web'), 'tari-universe-web');
  assert.equal(slugify('Caravel'), 'caravel');
});

test('unreviewed generic seed covers are suppressed', () => {
  const empty = mkdtempSync(path.join(tmpdir(), 'preview-seed-'));
  try {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import {load, previewFor} from ${JSON.stringify(new URL('../previews.mjs', import.meta.url).href)};
  load();
  // URL match across a title variation ("Caravel Labs" vs seed "Caravel").
  const byUrl = previewFor({ type: 'app', title: 'Caravel Labs', sourceUrl: 'https://caravellabs.net/' });
  assert.equal(byUrl,null, 'generic poster cannot stand in for source-specific imagery');
  // A reviewed repository capture now provides a source-specific poster.
  const bySlug = previewFor({ type: 'app', title: 'Private Ballot' });
  assert.match(bySlug.image,/contest-private-ballot/);
  assert.equal(bySlug.video,null);
  assert.match(bySlug.source,/Recorded webpage/);
    `], {env: {...process.env, CREATOR_HUB_PREVIEWS_DIR: empty}, encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
  } finally { rmSync(empty, {recursive:true, force:true}); }

});

test('canonical URLs preserve distinct ports and queries and reject non-web URLs',()=>{
 assert.notEqual(canonicalUrl('https://example.com:8443/a'),canonicalUrl('https://example.com/a'));
 assert.notEqual(canonicalUrl('https://example.com/?app=1'),canonicalUrl('https://example.com/?app=2'));
 assert.equal(canonicalUrl('file:///etc/passwd'),null);
});

test('Sapient runtime recording wins for the legacy catalog URL', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'preview-sapient-'));
  try {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import {writeFileSync} from 'node:fs';
      const dir = process.env.CREATOR_HUB_PREVIEWS_DIR;
      writeFileSync(dir+'/sapient.mp4', 'test fixture');
      writeFileSync(dir+'/index.json', JSON.stringify([{slug:'sapient',url:'https://sapient.tari.mw/',source:'capture',video:'/previews/sapient.mp4'}]));
      const {load,previewFor} = await import(${JSON.stringify(new URL('../previews.mjs', import.meta.url).href)});
      load();
      const preview = previewFor({type:'app',title:'Sapient',demoUrl:'https://sapient.tari.com/'});
      assert.equal(preview.video, '/previews/sapient.mp4');
      assert.match(preview.source, /Recorded webpage/);
    `], {env:{...process.env,CREATOR_HUB_PREVIEWS_DIR:dir},encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});

test('catalog covers match stable IDs across types while original videos win',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'catalog-covers-'));
 try {
  const result=spawnSync(process.execPath,['--input-type=module','-e',`
   import assert from 'node:assert/strict';
   import {writeFileSync} from 'node:fs';
   const dir=process.env.CREATOR_HUB_PREVIEWS_DIR;
   writeFileSync(dir+'/resource-one.mp4','fixture');
   writeFileSync(dir+'/catalog-index.json',JSON.stringify([{id:'starter:one',source:'cover',video:'/previews/resource-one.mp4',review:{policyVersion:1,resourceId:'starter:one',faithfulToSource:true,uniqueVisual:true,reviewer:'fixture reviewer',reviewedAt:'2026-09-21',sceneDescription:'A source-specific reviewed scene showing the actual template inputs and outputs.',references:['https://example.com/source'],videoSha256:'f16d05ec6b29248d2c61adb1e9263f78e4f7bace1b955014a2d17872cfe4064d'}}]));
   const {load,previewFor}=await import(${JSON.stringify(new URL('../previews.mjs',import.meta.url).href)});
   load();
   const r={id:'starter:one',type:'starter',title:'Same name',preview:{image:'https://example.com/photo.png'}};
   assert.equal(previewFor(r).video,'/previews/resource-one.mp4');
   assert.match(previewFor(r).source,/Animated album artwork/);
   writeFileSync(dir+'/capture.mp4','real capture fixture');
   writeFileSync(dir+'/index.json',JSON.stringify([{slug:'same-name',source:'capture',video:'/previews/capture.mp4'}]));load();
   assert.equal(previewFor({...r,type:'app'}).video,'/previews/resource-one.mp4','reviewed album art wins over automatic capture');
   assert.equal(previewFor({...r,id:'starter:two'}).video,undefined);
   const original={video:'https://example.com/real.mp4'};
   assert.deepEqual(previewFor({...r,preview:original}),original);
   const {readFileSync}=await import('node:fs');
   const entries=JSON.parse(readFileSync(dir+'/catalog-index.json','utf8'));
   const duplicate={...entries[0],id:'starter:two',review:{...entries[0].review,resourceId:'starter:two'}};
   writeFileSync(dir+'/catalog-index.json',JSON.stringify([...entries,duplicate]));load();
   assert.equal(previewFor({id:'starter:two',type:'starter'}),null,'identical video cannot be reused across resources');
   writeFileSync(dir+'/resource-one.mp4','changed after review');load();
   assert.equal(previewFor({id:'starter:one',type:'starter'}),null,'modified video requires a new review');
  `],{env:{...process.env,CREATOR_HUB_PREVIEWS_DIR:dir},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('restored catalog video upgrades the same resource seed poster', () => {
 const dir=mkdtempSync(path.join(tmpdir(),'restored-covers-'));
 try {
  const result=spawnSync(process.execPath,['--input-type=module','-e',`
   import assert from 'node:assert/strict';
   import {writeFileSync} from 'node:fs';
   const dir=process.env.CREATOR_HUB_PREVIEWS_DIR;
   writeFileSync(dir+'/legacy-vault.mp4','captured fixture');
   writeFileSync(dir+'/catalog-index.json',JSON.stringify([{id:'tari-ootle:app:legacy-vault',source:'capture',video:'/previews/legacy-vault.mp4'}]));
   const {load,previewFor}=await import(${JSON.stringify(new URL('../previews.mjs',import.meta.url).href)});
   load();
   assert.equal(previewFor({id:'tari-ootle:app:legacy-vault',type:'app',title:'Legacy Vault'}).video,'/previews/legacy-vault.mp4');
  `],{env:{...process.env,CREATOR_HUB_PREVIEWS_DIR:dir},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 } finally {rmSync(dir,{recursive:true,force:true});}
});
