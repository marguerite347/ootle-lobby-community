// Keep dated source observations separate from imported creator descriptions.
export function withProjectReviewNote(summary, reviewNote) {
  if (!reviewNote || summary?.includes(reviewNote)) return summary;
  return [summary, reviewNote].filter(Boolean).join('\n\n');
}
