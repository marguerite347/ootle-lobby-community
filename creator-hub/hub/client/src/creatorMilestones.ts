export type CreatorMilestone = 'created' | 'saved' | 'published';
export const MILESTONE_EVENT = 'hub:creator-milestone';

export function announceMilestone(milestone: CreatorMilestone) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MILESTONE_EVENT, {detail: milestone}));
  }
}
