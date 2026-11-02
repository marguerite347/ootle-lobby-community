export type ListingContest = {label: string; topicId: string; forumUrl: string; requirements: string};
export const LISTING_CONTESTS: Record<'october-2026' | 'november-2026', ListingContest>;
export function listingContest(destination: string): ListingContest | undefined;
