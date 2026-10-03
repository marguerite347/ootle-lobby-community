# GameKitPrimitives

Small game-UI primitives from the Game UI Kit: a four-step creator path, a quest progress meter and a confirmed-success notice.

Static renditions of `CreatorPath`, `QuestProgress` and `SuccessNotice` in `components/GameKit.tsx` (demo page `/create/ui-kit`). Props: `CreatorPath{current}`, `QuestProgress{value,target,label}`, `SuccessNotice{children}`.

- The kit defines its own `--game-lime #c4ff38`, `--game-lilac #bea5ff`, `--game-ink #101018`, `--game-stroke #51416e`.
- Current path step gets a lime tint and number; progress bars are 9px lime on a faint track.
- SuccessNotice pops once (`success-pop`, .65s) and must describe only what really happened ("Preview only. Nothing was saved or awarded." when nothing was). The pop is off under reduced motion.
