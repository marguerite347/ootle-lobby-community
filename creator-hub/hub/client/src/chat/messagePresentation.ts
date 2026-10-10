import type { Message } from "./communityAppApi";

export const reactions = [
  ["👍", "Like"],
  ["❤️", "Love"],
  ["😂", "Laugh"],
  ["🎉", "Celebrate"],
  ["👀", "Looking"],
  ["🚀", "Rocket"],
] as const;
export function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
export function groupsWith(previous: Message | undefined, message: Message) {
  if (
    !previous ||
    !message.account_id ||
    previous.account_id !== message.account_id
  )
    return false;
  const gap = Date.parse(message.created_at) - Date.parse(previous.created_at);
  return (
    previous.author_name === message.author_name &&
    previous.platform === message.platform &&
    previous.parent_id === message.parent_id &&
    sameDay(previous.created_at, message.created_at) &&
    gap >= 0 &&
    gap < 5 * 60_000
  );
}
export function messagePosition(messages: Message[], index: number) {
  const before = groupsWith(messages[index - 1], messages[index]);
  const after = groupsWith(
    messages[index],
    messages[index + 1] ?? { ...messages[index], account_id: null },
  );
  return before ? (after ? "normal" : "last") : after ? "first" : "single";
}
export function dayLabel(value: string) {
  const date = new Date(value),
    today = new Date(),
    yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  return sameDay(value, today.toISOString())
    ? "Today"
    : sameDay(value, yesterday.toISOString())
      ? "Yesterday"
      : date.toLocaleDateString([], {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
}
