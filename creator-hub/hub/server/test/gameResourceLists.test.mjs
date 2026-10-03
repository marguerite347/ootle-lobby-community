import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseList,classifyEntry} from '../connectors/gameResourceLists.mjs';
test('lists preserve heading context, parse reference links and table cells, exclude navigation and unsafe URLs',()=>{
 const markdown='## Art\n| Sprite studio ([link](https://example.com/sprites)) | [Pack](https://example.com/pack) |\n* [Other][1]\n* [Duplicate](https://example.com/pack#again)\n* [Contents](#top)\n* [Bad](javascript:alert)\n[1]: https://example.com/other\n';
 const rows=parseList(markdown,{});
 assert.equal(rows.length,3);assert.equal(rows[0].section,'Art');assert.equal(rows[0].title,'Sprite studio');assert.ok(rows.every(row=>row.type==='asset'));
});
test('Awesome directory imports only Gaming and stops at next section',()=>{
 const rows=parseList('## Apps\n- [App](https://example.com/app)\n## Gaming\n- [Flame](https://example.com/flame)\n### Engines\n- [Game](https://example.com/game)\n## Other\n- [Other](https://example.com/other)',{section:'Gaming'});
 assert.deepEqual(rows.map(r=>r.title),['Flame','Game']);
});
test('map learning, assets, workflow references, templates and engine components without runtime claims',()=>{
 assert.equal(classifyEntry('Audio tutorial','Audio').type,'learn');
 assert.equal(classifyEntry('Build pipeline','Tools').assetKind,'workflow');
 assert.equal(classifyEntry('Starter template','Templates').type,'starter');
 assert.equal(classifyEntry('Physics library','Engines').type,'component');
});

test('Kickstarter and document templates are not playable starters; parenthesized URLs remain intact',()=>{
 assert.equal(classifyEntry('Kickstarter examples','Business').type,'learn');
 assert.equal(classifyEntry('Game design document template','Design').assetKind,'workflow');
 assert.equal(classifyEntry('inja template engine','Programming').type,'component');
 const rows=parseList('## Learning\n- [Math](https://example.com/Math_(game))',{});
 assert.equal(rows[0].url,'https://example.com/Math_(game)');
});
