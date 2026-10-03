// Save-conflict resolution logic, kept pure so it is unit-testable.
//
// Invariant (the data-loss bug this guards against): when a save returns 409 because
// another editor saved first, the losing editor's unsaved draft (notes + components)
// must NEVER be silently overwritten. We enter a conflict state that keeps the draft
// intact and stores the latest snapshot separately, then only mutate the draft or the
// expected head when the user explicitly chooses overwrite or discard.

export type Draft = { notes: string; components: any[] };
export type Snapshot = { head: string | null; notes: string; components: any[] };

// Enter conflict mode: the draft is returned untouched; the latest is held aside.
export function enterConflict(draft: Draft, latest: Snapshot): { draft: Draft; conflict: Snapshot } {
  return { draft: { notes: draft.notes, components: [...draft.components] }, conflict: latest };
}

// User chose to keep their changes: retain the draft, retarget the latest head.
export function resolveOverwrite(draft: Draft, latest: Snapshot): { notes: string; components: any[]; expectedHead: string | null } {
  return { notes: draft.notes, components: draft.components, expectedHead: latest.head };
}

// User chose to drop their changes in favour of the latest snapshot.
export function resolveDiscard(latest: Snapshot): { notes: string; components: any[]; expectedHead: string | null } {
  return { notes: latest.notes, components: [...latest.components], expectedHead: latest.head };
}
