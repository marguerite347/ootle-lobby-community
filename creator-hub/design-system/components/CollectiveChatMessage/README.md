# CollectiveChatMessage

Message card in the Collective Chat project room, with role and status chips and an optional artifact link.

Static rendition of `chat/CollectiveChatPanel.tsx`. It must sit inside `.collective-chat-root`, which defines the chat's `--cc-*` palette. The consumer supplies `author`, `authorKind`, `roleName`, `kind` (`working · blocker · delivered`), `body`, `artifactUrl` and `clientState` (`queued · sent · failed`).

- Palette caveat: the chat uses its own blue and gold palette (`--cc-accent #5b9fd4`, focus `#f0c14a`), not the Lobby lavender and lime. Convert it to tokens before adopting the high-contrast theme.
- Kind chips carry a word as well as a border colour. Failed messages get a danger border; queued ones dim to 85%.
