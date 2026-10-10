type Cursor = { id: string; cursor_at: string };
type Page<T> = { messages: T[]; hasMore: boolean };
/** Fill a reconnect gap before merging; bounded work can reset to a complete
 * recent window, whose older history remains accessible through pagination. */
export async function privateCatchup<T extends Cursor>(
  first: Page<T>,
  known: Set<string>,
  previous: (row: T) => Promise<Page<T>>,
) {
  let page = first,
    messages = [...first.messages],
    count = 0;
  const gap = () =>
    known.size > 0 &&
    page.hasMore &&
    page.messages.length > 0 &&
    !page.messages.some((row) => known.has(row.id));
  while (gap() && count++ < 10) {
    page = await previous(page.messages[0]);
    messages = [...page.messages, ...messages];
  }
  return { messages, hasMore: page.hasMore, reset: gap() };
}
