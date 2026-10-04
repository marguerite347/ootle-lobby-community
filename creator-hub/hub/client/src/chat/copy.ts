// INTEGRATION_GAP[LOBBY-AGENT-BRIDGE] (build-required): see docs/DEVELOPMENT_GAPS.md#lobby-agent-bridge.
/** In-product copy from Moderator rules §9 — Slice 1 honesty. */
export const ROOM_ID = 'lobby-collective' as const;

export const copy = {
  launcherLabel: 'Chat',
  launcherOpen: 'Open chat',
  launcherClose: 'Close chat',
  panelTitle: 'Chat',
  roomName: 'Lobby · shared project room',
  emptyRoom:
    'Shared project room. Post working, blocker, or delivered updates with an artifact or a concrete next step.',
  composerHelper: 'Include who · status · artifact or blocker · next · due.',
  bridgeAbsent:
    'Live Hub↔agent bridge is not connected. Agent coordination stays outside this panel until Producer confirms a bridge.',
  spamNotice:
    'Duplicate update hidden. Add a new artifact or a sharper blocker to post again.',
  popOut: 'Pop out',
  popOutTitle: 'Chat · Ootle Lobby',
  send: 'Send',
  retry: 'Retry',
  kindWorking: 'Working',
  kindBlocker: 'Blocker',
  kindDelivered: 'Delivered',
  labelHuman: 'Human',
  labelAgent: 'Agent',
  labelModerator: 'Moderator',
  labelSystem: 'System',
  authorPlaceholder: 'Your name',
  bodyPlaceholder: 'who · status · artifact or blocker · next · due',
  artifactPlaceholder: 'Artifact URL or path (optional)',
  loadError: 'Could not load messages.',
  sendError: 'Message failed to send. You can retry.',
} as const;

export const KIND_OPTIONS = [
  { value: 'working', label: copy.kindWorking },
  { value: 'blocker', label: copy.kindBlocker },
  { value: 'delivered', label: copy.kindDelivered },
] as const;

export const AUTHOR_KIND_OPTIONS = [
  { value: 'Human', label: copy.labelHuman },
  { value: 'Agent', label: copy.labelAgent },
  { value: 'Moderator', label: copy.labelModerator },
  { value: 'System', label: copy.labelSystem },
] as const;

/** Sidebar shell copy: one right-docked sidebar holding both rooms. Shared labels live in `copy`. */
export const sidebarCopy = {
  collapse: 'Collapse chat',
  popOutLabel: 'Open chat in a new window',
  tabListLabel: 'Chat rooms',
  communityTab: 'Community',
  projectTab: 'Project room',
} as const;

/** Community room copy. Rejection messages come from the server (communityChat.mjs). */
export const communityCopy = {
  roomName: 'Players and creators, hanging out',
  rulesNote:
    'Be kind. No personal info. Never share keys or seed phrases. Everything here is public.',
  empty: 'No messages yet. Say hi to the Lobby.',
  nameLabel: 'Display name',
  nameHelper: 'You pick it. Names are not verified.',
  namePlaceholder: 'What should we call you?',
  bodyLabel: 'Message',
  bodyPlaceholder: 'Say something to the Lobby',
  send: 'Send',
  sending: 'Sending…',
  report: 'Report',
  reported: 'Reported',
  reportLabel: (name: string) => `Report message from ${name}`,
  reportThanks: 'Thanks. A moderator will take a look.',
  reportError: 'Could not send the report. Try again.',
  loadError: 'Could not load messages. Retrying…',
  sendError: 'Message not sent. Check your connection and try again.',
  characterCount: (used: number, max: number) => `${used}/${max}`,
  enterHint: 'Enter sends. Shift+Enter adds a line.',
} as const;
