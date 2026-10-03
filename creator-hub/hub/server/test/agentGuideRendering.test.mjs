import test from 'node:test';
import assert from 'node:assert/strict';
import {agentGuideHtml} from '../agentShell.mjs';

test('site guide tables retain clickable instruction links and escape source markup', () => {
  const html = agentGuideHtml('| Role | Read |\n| --- | --- |\n| Designer | [Instructions](/agent-roles/game-design.md) |\n| <script> | safe |');
  assert.match(html, /<table>/);
  assert.match(html, /href="\/agent-roles\/game-design.md"/);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});
test('first-visit steps are ordered and fourth-level headings have anchors', () => {
  const html = agentGuideHtml('1. Read the guide.\n2. Record your plan.\n\n#### Skills receipt');
  assert.match(html, /<ol><li>Read the guide\./);
  assert.match(html, /<h4 id="skills-receipt">/);
});

test('wrapped list steps preserve emphasis and continuation text', () => {
  const html = agentGuideHtml('1. **Read** the guide.\n   Read all sections.\n2. Plan.');
  assert.match(html, /<ol><li><strong>Read<\/strong> the guide. Read all sections.<\/li>/);
});
