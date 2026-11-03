import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {maintenanceCheckouts} from '../scripts/maintenance-checkouts.mjs';

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
