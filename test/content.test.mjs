import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProjects, validateFeed} from '../lib/content.mjs';
const project = () => ({id:'tari-ootle:app:example',title:'Example',summary:'A community project.',technologies:[{label:'Template',sourceUrl:'https://github.com/example/project'}]});
test('accepts plain project content and a traceable feed', () => {
  assert.equal(validateProjects([project()]).length, 1);
  assert.ok(validateFeed({schemaVersion:1,revision:'a'.repeat(40),publishedAt:'2026-10-03T00:00:00Z',projects:[project()]}));
});
test('rejects injected links, markup, duplicate ids and unsupported fields', () => {
  for (const url of ['javascript:alert(1)','http://example.com','https://name:password@example.com']) {
    const value=project();value.technologies[0].sourceUrl=url;assert.throws(()=>validateProjects([value]));
  }
  assert.throws(()=>validateProjects([{...project(),summary:'<script>alert(1)</script>'}]));
  assert.throws(()=>validateProjects([project(),project()]));
  assert.throws(()=>validateProjects([{...project(),stars:1000}]));
  assert.throws(()=>validateFeed({schemaVersion:1,revision:'main',publishedAt:'bad',projects:[project()]}));
});
