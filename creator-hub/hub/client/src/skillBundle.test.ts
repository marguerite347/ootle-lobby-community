import {describe, it, expect} from 'vitest';
import {unzipSync, strFromU8} from 'fflate';
import {skillBundleArchive} from './skillBundle';

describe('skill bundle delivery', () => {
  it('retains the entrypoint, nested references and license in an extractable ZIP', () => {
    const files = {'SKILL.md': '# Creator skill', 'references/guide.md': 'Narration — verify playback', LICENSE: 'Apache-2.0'};
    const extracted = unzipSync(skillBundleArchive(files));
    expect(Object.fromEntries(Object.entries(extracted).map(([name, data]) => [name, strFromU8(data)]))).toEqual(files);
  });
  it('rejects unsafe archive paths and empty bundles', () => {
    for (const name of ['../outside', '/absolute', 'a/../../outside', 'a\\outside', 'a//b']) expect(() => skillBundleArchive({[name]: 'bad'})).toThrow();
    expect(() => skillBundleArchive({})).toThrow();
  });
});
