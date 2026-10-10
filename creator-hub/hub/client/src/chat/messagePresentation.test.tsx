import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Message as KitMessage } from "@chatscope/chat-ui-kit-react";
import { groupsWith, messagePosition, sameDay } from "./messagePresentation";
import type { Message } from "./communityAppApi";
const message: Message = {
  id: "a",
  channel_id: "lobby",
  account_id: "guest-1",
  author_name: "Same name",
  body: "Hello",
  parent_id: null,
  platform: "ootle",
  created_at: "2026-10-10T12:00:00Z",
  reply_count: 0,
  deliveries: [],
};
test("grouping follows identity and context rather than a disposable display name", () => {
  const next = { ...message, id: "b", created_at: "2026-10-10T12:01:00Z" };
  expect(groupsWith(message, next)).toBe(true);
  for (const change of [
    { account_id: "guest-2" },
    { account_id: null },
    { platform: "telegram" },
    { author_name: "Renamed" },
    { parent_id: "thread" },
    { created_at: "2026-10-10T12:06:00Z" },
    { created_at: "2026-10-10T11:59:00Z" },
  ])
    expect(groupsWith(message, { ...next, ...change })).toBe(false);
  expect(
    [0, 1, 2].map((i) =>
      messagePosition([message, next, { ...next, id: "c" }], i),
    ),
  ).toEqual(["first", "normal", "last"]);
  expect(sameDay("2026-10-09T12:00:00Z", "2026-10-10T12:00:00Z")).toBe(false);
});
test("the reused message primitive renders untrusted message text as text", () => {
  const html = renderToStaticMarkup(
    <KitMessage
      model={{ direction: "incoming", position: "single", type: "custom" }}
    >
      <KitMessage.CustomContent>
        <p>{"<img src=x onerror=alert(1)>\nSecond line"}</p>
      </KitMessage.CustomContent>
    </KitMessage>,
  );
  expect(html).toContain("&lt;img");
  expect(html).not.toContain("<img src=x");
  expect(html).toContain("Second line");
});
