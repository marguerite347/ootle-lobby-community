export const GOAL_STARTER_SHELF_SIZE: number;
export const RECOMMENDED_STARTER_LIMIT: number;
export function saveProjectButtonLabel(title: string): string;
export function starterProjectPath(templateId: string): string;
export function gdevelopStarterDimension(record: { title?: string; id?: string; provenance?: { upstreamId?: string } }): '2d' | '3d';
export function tagsWithDimension(tags: string[] | undefined, dimension: '2d' | '3d'): string[];
export function threeDimensionalShelfLabel(dimension?: string | null): '3D' | null;
export function presentStarter<RecordType extends { ecosystem?: string; tags?: string[] } | null>(record: RecordType): RecordType;
