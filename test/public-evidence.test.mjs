import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

const privateEvidenceLocation = /(?:https?:\/\/)?(?:\w+\.)?discord(?:app)?\.(?:com|net)\/(?:channels|attachments)|(?:cdn|media)\.discordapp\.(?:com|net)|(?:^|[\s"'])\/(?:Users|private\/var|var\/folders)\//i;
test('public maintenance exports exclude private channel links and workstation paths', () => {
  for (const name of ['docs/ecosystem-source-registry.json', 'docs/resource-provenance.json', 'docs/resource-captures.json', 'creator-hub/hub/shared/ecosystemResources.json', 'creator-hub/hub/data/seed/catalog.json']) {
    const body = read(name);
    assert.equal(privateEvidenceLocation.test(body), false, `${name}: keep private evidence in the maintenance workspace`);
    assert.doesNotMatch(body, /"visibility"\s*:\s*"(?:private|restricted|internal)"/i);
  }
});

test("privacy guard distinguishes public user profiles from workstation paths", () => {
  assert.equal(privateEvidenceLocation.test("https://content.luanti.org/users/Wuzzy"), false);
  assert.equal(privateEvidenceLocation.test(JSON.stringify({path: "/Users/example/private.json"})), true);
  assert.equal(privateEvidenceLocation.test("https://discord.com/channels/1/2/3"), true);
});
