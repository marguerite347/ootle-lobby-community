// Keep dated source observations separate from imported creator descriptions.
export function withProjectReviewNote(summary, reviewNote) {
  if (!reviewNote || summary?.includes(reviewNote)) return summary;
  const description=summary?.trim();
  const sentence=description && !/[.!?]$/.test(description) ? `${description}.` : description;
  return [sentence, reviewNote].filter(Boolean).join('\n\n');
}
