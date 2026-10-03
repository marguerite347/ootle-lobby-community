import path from 'node:path';
import {runtimeDir} from './paths.mjs';
import {createCommunityChat, cleanName, cleanBody} from './communityChat.mjs';

const fail = (message, status = 400) => { throw Object.assign(new Error(message), {status}); };

/** Project invitations reuse Community chat validation, reports and rate limits. */
export function createProjectChat({dataDir = path.join(runtimeDir, 'project-chat')} = {}) {
  const invitations = createCommunityChat({dataDir: path.join(dataDir, 'invitations')});
  const chats = new Map();
  const asRoom = message => {
    const [title, ...description] = message.body.split('\n');
    return {id: message.id, title, description: description.join('\n'), creator: message.name, createdAt: message.at};
  };
  function listRooms() {
    return {rooms: invitations.listMessages().messages.map(asRoom).reverse()};
  }
  function getRoom(id) {
    const room = listRooms().rooms.find(item => item.id === id);
    if (!room) fail('This project room is no longer available.', 404);
    return room;
  }
  function createRoom(input = {}, context = {}) {
    const title = cleanName(input.title);
    const description = cleanBody(input.description);
    if (!title || title.length > 60) fail('Give your project a name of up to 60 characters.');
    if (!description || description.length > 400) fail('Describe your project and the help you want in up to 400 characters.');
    if (listRooms().rooms.length >= 80) fail('The project room list is full right now.', 409);
    return asRoom(invitations.postMessage({name: input.name, clientId: input.clientId, body: `${title}\n${description}`}, context));
  }
  function roomChat(id) {
    getRoom(id); // Only an existing, visible invitation can select a directory.
    if (!chats.has(id)) chats.set(id, createCommunityChat({dataDir: path.join(dataDir, 'rooms', id)}));
    return chats.get(id);
  }
  return {
    listRooms, getRoom, createRoom,
    listMessages: id => roomChat(id).listMessages(),
    postMessage: (id, input, context) => roomChat(id).postMessage(input, context),
    reportMessage: (id, messageId, input) => roomChat(id).reportMessage(messageId, input),
    reportRoom: (id, input) => invitations.reportMessage(id, input),
  };
}
