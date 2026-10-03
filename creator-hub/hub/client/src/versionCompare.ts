import type { ProjectState } from "./api";
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object")
    return JSON.stringify(
      Object.keys(value)
        .sort()
        .map((key) => [key, stable((value as Record<string, unknown>)[key])]),
    );
  return JSON.stringify(value) ?? "undefined";
}
export function compareProjectStates(
  before: ProjectState,
  after: ProjectState,
) {
  const previous = new Map(
    (before.components || []).map((component) => [component.id, component]),
  );
  const current = new Map(
    (after.components || []).map((component) => [component.id, component]),
  );
  const label = (component: { title?: string; id: string }) =>
    component.title || component.id;
  return {
    added: [...current.values()]
      .filter((component) => !previous.has(component.id))
      .map(label),
    removed: [...previous.values()]
      .filter((component) => !current.has(component.id))
      .map(label),
    changed: [...current.values()]
      .filter(
        (component) =>
          previous.has(component.id) &&
          stable(previous.get(component.id)) !== stable(component),
      )
      .map(label),
    notesChanged: (before.notes || "") !== (after.notes || ""),
    recipeChanged:
      stable(before.recipe) !== stable(after.recipe) ||
      before.templateId !== after.templateId,
    workflowChanged: stable(before.workflow) !== stable(after.workflow),
  };
}
