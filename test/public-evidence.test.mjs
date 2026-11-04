import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const privateEvidenceLocation = /(?:https?:\/\/)?(?:\w+\.)?discord(?:app)?\.(?:com|net)\/(?:channels|attachments)|(?:cdn|media)\.discordapp\.(?:com|net)|\/Users\/|\/private\/var\/|\/var\/folders\//i;
test('public maintenance exports exclude private channel links and workstation paths', () => {
  for (const name of ['ecosystem-source-registry', 'resource-provenance', 'resource-captures']) {
    const body = read(`docs/${name}.json`);
    assert.doesNotMatch(body, privateEvidenceLocation, `${name}: keep private evidence in the maintenance workspace`);
    assert.doesNotMatch(body, /"visibility"\s*:\s*"(?:private|restricted|internal)"/i);
  }
});
