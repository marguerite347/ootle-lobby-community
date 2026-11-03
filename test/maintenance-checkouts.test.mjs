import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {maintenanceCheckouts,rustManifestScope,catalogResourceScope} from '../scripts/maintenance-checkouts.mjs';
import {assessMaintenance,requiredSections} from '../scripts/maintenance-completion.mjs';

test('migrated catalogs are read from identified code checkouts, never old evidence copies', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'maintenance-checkouts-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const locations={};
  for(const [name,repo,catalog] of [
    ['lobby','ootle-lobby-community','creator-hub/hub/shared/ecosystemResources.json'],
    ['workbench','ootle-workbench','apps/remix-ide/src/app/plugins/ootle/ecosystem-resources.json'],
  ]) {
    const dir=locations[name]=path.join(root,'Developer',name);
    const git=(...args)=>execFileSync('git',['-C',dir,...args],{stdio:'pipe'});
    fs.mkdirSync(path.dirname(path.join(dir,catalog)),{recursive:true});
    fs.writeFileSync(path.join(dir,catalog),JSON.stringify({records:[{id:`current-${name}`}]}));
    git('init');git('remote','add','origin',`https://github.com/marguerite347/${repo}.git`);
    git('add','.');git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','-m','fixture');
  }
  fs.mkdirSync(path.join(root,'Documents/work/lobby'),{recursive:true});
  const result=maintenanceCheckouts(locations.lobby,locations.workbench);
  assert.deepEqual(result.map(r=>r.records[0].id),['current-lobby','current-workbench']);
  assert.ok(result.every(r=>/^[a-f0-9]{40}$/.test(r.revision)));
  assert.throws(()=>maintenanceCheckouts(locations.lobby,path.join(root,'missing')));
  execFileSync('git',['-C',locations.workbench,'remote','set-url','origin','https://github.com/other/ootle-workbench.git']);
  assert.throws(()=>maintenanceCheckouts(locations.lobby,locations.workbench),/origin does not identify/);
});

test('new bundled and vendored Cargo manifests cannot disappear from completion scope', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'maintenance-rust-scope-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  execFileSync('git',['-C',root,'init'],{stdio:'pipe'});
  for(const file of ['examples/counter/Cargo.toml','examples/counter/vendor/patch/Cargo.toml']) {
    fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
    fs.writeFileSync(path.join(root,file),'[package]\nname = "fixture"\nversion = "0.1.0"\n');
  }
  execFileSync('git',['-C',root,'add','.']);
  const scope=rustManifestScope([{name:'lobby',checkout:root}]);
  assert.equal(scope.length,2);
  assert.ok(scope.includes('lobby/examples/counter/vendor/patch/Cargo.toml:manifest-review'));
  const run={date:'2026-11-03',sections:Object.fromEntries(requiredSections.map(name=>[name,{expectedIds:['done'],items:[{id:'done',status:'complete',checkedAt:'2026-11-03',coverageComplete:true,evidence:['receipt.json']}]}]))};
  const result=assessMaintenance(run,{requiredScope:{dependencies:scope}});
  assert.equal(result.status,'incomplete');
  assert.equal(result.issues.filter(s=>s.includes('missing from maintained scope')).length,2);
});


test('unrecorded projects and opportunities cannot disappear from existing-resource scope', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'maintenance-catalog-scope-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  execFileSync('git',['-C',root,'init'],{stdio:'pipe'});
  const catalogPath=path.join(root,'catalog.json');
  fs.writeFileSync(catalogPath,JSON.stringify({records:[{id:'sdk'}],opportunities:[{id:'new-opportunity'}]}));
  fs.mkdirSync(path.join(root,'content/projects'),{recursive:true});
  fs.writeFileSync(path.join(root,'content/projects/new-project.json'),JSON.stringify({slug:'new-project',resourceIds:['sdk']}));
  execFileSync('git',['-C',root,'add','.']);
  const scope=catalogResourceScope([{name:'lobby',checkout:root,catalogPath}]);
  assert.deepEqual(new Set(scope),new Set(['project:new-project','new-opportunity']));
  const run={date:'2026-11-03',sections:Object.fromEntries(requiredSections.map(name=>[name,{expectedIds:['done'],items:[{id:'done',status:'complete',checkedAt:'2026-11-03',coverageComplete:true,evidence:['receipt.json']}]}]))};
  const result=assessMaintenance(run,{requiredScope:{existingResources:scope}});
  assert.equal(result.status,'incomplete');
  assert.equal(result.issues.filter(s=>s.includes('missing from maintained scope')).length,2);
});
