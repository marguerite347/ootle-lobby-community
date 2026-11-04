import {test} from 'node:test';
import assert from 'node:assert/strict';
import {withEcosystemResources, ecosystemResources} from '../ecosystemResources.mjs';

test('repository overview deduplication preserves individual templates and guides', () => {
  const overview = ecosystemResources.records.find(r => r.repoUrl === 'https://github.com/tari-project/wasm-template');
  const records = [
    {id:'old-overview', sourceUrl:overview.repoUrl, repoUrl:overview.repoUrl},
    {id:'game-template', type:'starter', sourceUrl:`${overview.repoUrl}/tree/main/examples/guessing_game/template`, repoUrl:overview.repoUrl},
    {id:'game-guide', type:'learn', sourceUrl:'https://ootle.tari.com/guides/build-a-guessing-game/', repoUrl:overview.repoUrl},
  ];
  const result = withEcosystemResources(records, [overview]);
  assert.deepEqual(result.map(r => r.id), ['game-template', 'game-guide', overview.id]);
  assert.equal(records.length, 3, 'the retained source snapshot is unchanged');
});
