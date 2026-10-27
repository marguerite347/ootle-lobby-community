import {expect, test} from 'vitest';
import resources from '../../../shared/ecosystemResources.json';
import {builderResourcesOnly, homepageResources} from './homepageEcosystem';

test('contest and community projects appear in their galleries, while builder resources remain', () => {
  const keys = homepageResources.map(record => record.key);
  for (const duplicate of ['crypt', 'ghostline', 'seance', 'caravel-burn-wallet', 'hearth', 'grave-robber']) {
    expect(keys).not.toContain(duplicate);
    expect(resources.records.some(record => record.key === duplicate)).toBe(true);
  }
  for (const tool of ['official-agent-docs', 'ootle-ts', 'ootle-python', 'caravel-faucet', 'ons', 'taritracker-faucet']) {
    expect(keys).toContain(tool);
  }
});

test('new submissions are excluded despite repository URL spelling or different catalog IDs', () => {
  const records = [{id: 'tool:demo', repoUrl: 'https://github.com/Builder/Demo.git/'}, {id: 'tool:other', repoUrl: 'https://github.com/builder/other'}];
  expect(builderResourcesOnly(records, [{id: 'contest:demo', repoUrl: 'https://github.com/builder/demo'}])).toEqual([records[1]]);
});

test('identity and source links work without repositories and do not match missing URLs', () => {
  const records = [{id: 'same-id'}, {id: 'source-copy', sourceUrl: 'https://community.tari.com/t/example/396/7?u=author'}, {id: 'unrelated'}];
  expect(builderResourcesOnly(records, [{id: 'same-id'}, {sourceUrl: 'https://community.tari.com/t/example/396/7'}])).toEqual([records[2]]);
});

test('a monorepo subproject is not conflated with a different package', () => {
  const records = [{id: 'sdk', repoUrl: 'https://github.com/builder/tools/tree/main/sdk'}];
  expect(builderResourcesOnly(records, [{repoUrl: 'https://github.com/builder/tools/tree/main/game'}])).toEqual(records);
});

// A tool documented inside a showcased project is not a duplicate of that project.
test('preserves separately linked tools in a project documentation section', () => {
  const records = [{id: 'faucet', sourceUrl: 'https://github.com/builder/board#wallet-funding'}];
  expect(builderResourcesOnly(records, [{repoUrl: 'https://github.com/builder/board'}])).toEqual(records);
});

test('honors a gallery record that explicitly lists the canonical resource ID', () => {
  const records = [{id: 'app:demo'}];
  expect(builderResourcesOnly(records, [{resourceIds: ['app:demo']}])).toEqual([]);
});
