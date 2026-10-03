import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createProjectChat} from '../projectChat.mjs';

function fixture(t) {
  const dataDir = mkdtempSync(path.join(tmpdir(), 'project-chat-test-'));
  t.after(() => rmSync(dataDir, {recursive: true, force: true}));
  return {dataDir, chat: createProjectChat({dataDir})};
}
const creator = {name: 'Builder', clientId: 'builder-test-123'};
const contributor = {name: 'Artist', clientId: 'artist-test-456'};
const idea = {title: 'Moon Garden', description: 'Growing a cozy garden. Looking for artists.', ...creator};

test('a project announcement can be discovered and joined by another client', t => {
  const {dataDir, chat} = fixture(t);
  const room = chat.createRoom(idea);
  const otherClient = createProjectChat({dataDir});
  assert.equal(otherClient.listRooms().rooms[0].title, idea.title);
  assert.equal(otherClient.getRoom(room.id).creator, creator.name);
  otherClient.postMessage(room.id, {...contributor, body: 'I can help with the garden art.'});
  assert.equal(chat.listMessages(room.id).messages[0].name, 'Artist');
  assert.ok(!JSON.stringify(chat.listRooms()).includes(creator.clientId));
});

test('project messages stay in their room, survive a new store instance, and cannot select arbitrary paths', t => {
  const {dataDir, chat} = fixture(t);
  const first = chat.createRoom(idea);
  const second = chat.createRoom({...idea, title: 'Star Path'});
  chat.postMessage(first.id, {...creator, body: 'A new sketch is ready.'});
  assert.equal(chat.listMessages(second.id).messages.length, 0);
  assert.equal(createProjectChat({dataDir}).listMessages(first.id).messages.length, 1);
  assert.throws(() => chat.listMessages('../../community-chat'), {status: 404});
  assert.throws(() => chat.postMessage('missing', {...creator, body: 'Hello'}), {status: 404});
});

test('project invitations and messages keep existing input and reporting protections', t => {
  const {chat} = fixture(t);
  assert.throws(() => chat.createRoom({...idea, title: ''}), {status: 400});
  assert.throws(() => chat.createRoom({...idea, description: 'https://example.com'}), {code: 'link'});
  assert.throws(() => chat.createRoom({...idea, title: 'a'.repeat(61)}), {status: 400});
  const room = chat.createRoom(idea);
  const message = chat.postMessage(room.id, {...creator, body: 'The first sketch is ready.'});
  for (let i = 0; i < 3; i++) chat.reportMessage(room.id, message.id, {clientId: `reporter-${i}-123`});
  assert.equal(chat.listMessages(room.id).messages.length, 0);
  assert.throws(() => chat.reportRoom(room.id, creator), {status: 400});
  for (let i = 0; i < 3; i++) chat.reportRoom(room.id, {clientId: `reporter-${i}-123`});
  assert.equal(chat.listRooms().rooms.length, 0);
  assert.throws(() => chat.listMessages(room.id), {status: 404});
});
