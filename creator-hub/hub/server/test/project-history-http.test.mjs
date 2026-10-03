import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const root = mkdtempSync(path.join(tmpdir(), "project-history-http-"));
process.env.CREATOR_HUB_DATA_DIR = root;
const { createApp } = await import("../app.mjs");
after(() => rmSync(root, { recursive: true, force: true }));
test("history HTTP capability isolation and malformed version requests preserve current game", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function call(route, body, key) {
    const response = await fetch(base + route, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: response.status,
      cache: response.headers.get("cache-control"),
      body: await response.json(),
    };
  }
  try {
    const created = await call("/api/projects", { title: "History trial" });
    assert.equal(created.cache, "no-store");
    const { project, managementKey } = created.body;
    const other = (await call("/api/projects", { title: "Other owner" })).body;
    await call(`/api/projects/${project.id}/publish`, {
      state: { notes: "Keep current game" },
      message: "Current",
    });
    const detail = (await call(`/api/projects/${project.id}`)).body;
    assert.ok(!JSON.stringify(detail).includes(managementKey));
    assert.ok(
      !JSON.stringify((await call("/api/projects")).body).includes(
        managementKey,
      ),
    );
    const route = `/api/projects/${project.id}/manage-history`;
    const input = {
      action: "clear-history",
      expectedHead: detail.head,
      confirmation: project.id,
    };
    for (const key of [undefined, other.managementKey])
      assert.equal((await call(route, input, key)).status, 403);
    for (const ref of [undefined, null, "", false, [], {}, "HEAD"])
      assert.equal(
        (
          await call(
            route,
            { ...input, action: "delete-version", ref },
            managementKey,
          )
        ).status,
        400,
      );
    assert.equal(
      (await call(`/api/projects/${project.id}`)).body.versions.length,
      2,
    );
    assert.equal((await call(route, input, managementKey)).status, 200);
    const result = (await call(`/api/projects/${project.id}`)).body;
    assert.equal(result.versions.length, 1);
    assert.equal(
      (await call(`/api/projects/${project.id}/state`)).body.notes,
      "Keep current game",
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
