import { randomBytes, createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  renameSync,
  rmSync,
  mkdtempSync,
  lstatSync,
} from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { runtimeDir } from "./paths.mjs";
const execute = promisify(execFile);
const keyDirectory = path.join(runtimeDir, "project-management");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
function keyPath(id) {
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(id)) fail("Invalid project ID");
  return path.join(keyDirectory, id + ".json");
}
export function issueManagementKey(id) {
  const file = keyPath(id);
  if (existsSync(file)) fail("Management key already exists", 409);
  const key = randomBytes(32).toString("hex");
  mkdirSync(keyDirectory, { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify({ hash: digest(key) }), {
    mode: 0o600,
    flag: "wx",
  });
  return key;
}
export function authorizeManagement(id, key) {
  const file = keyPath(id);
  if (
    typeof key !== "string" ||
    !existsSync(file) ||
    digest(key) !== JSON.parse(readFileSync(file, "utf8")).hash
  )
    fail(
      "Project management key required. Existing projects need local administrator recovery.",
      403,
    );
}
export function forgetManagementKey(id) {
  rmSync(keyPath(id), { force: true });
}
async function git(directory, args) {
  return (
    await execute(
      "git",
      [
        "-c",
        "user.name=Creator Hub",
        "-c",
        "user.email=creator-hub@tari.local",
        "-c",
        "commit.gpgsign=false",
        ...args,
      ],
      { cwd: directory, maxBuffer: 16 * 1024 * 1024 },
    )
  ).stdout.trim();
}
// Build an independent object store before switching, preserving the current files.
// Pruning removes discarded commit objects here; copies held elsewhere are independent.
export async function rewriteHistory(directory, removedRef) {
  if (!lstatSync(path.join(directory, ".git")).isDirectory())
    fail("History management requires a standalone project repository");
  if (await git(directory, ["status", "--porcelain"]))
    fail("Save or resolve working changes before deleting history", 409);
  const revisions = (
    await git(directory, ["rev-list", "--reverse", "HEAD"])
  ).split("\n");
  const head = revisions.at(-1);
  if (
    removedRef &&
    (!/^[a-f0-9]{40}$/.test(removedRef) || !revisions.includes(removedRef))
  )
    fail("Choose an existing full version hash");
  if (removedRef === head)
    fail(
      "Keep the current version. Choose an older version or delete the project.",
    );
  const retained = removedRef
    ? revisions.filter((ref) => ref !== removedRef)
    : [head];
  const temporary = mkdtempSync(
    path.join(path.dirname(directory), ".history-"),
  );
  const retired = path.join(temporary, "retired-git");
  let preserveRecovery = false;
  try {
    const clone = path.join(temporary, "repo");
    await git(path.dirname(directory), [
      "clone",
      "--no-local",
      "--no-hardlinks",
      "--quiet",
      directory,
      clone,
    ]);
    let parent;
    for (const ref of retained) {
      const tree = await git(clone, ["rev-parse", ref + "^{tree}"]);
      const message = removedRef
        ? await git(clone, ["log", "-1", "--format=%B", ref])
        : "Current version — earlier history cleared";
      parent = await git(clone, [
        "commit-tree",
        tree,
        ...(parent ? ["-p", parent] : []),
        "-m",
        message,
      ]);
    }
    await git(clone, ["update-ref", "refs/heads/managed-history", parent]);
    await git(clone, ["symbolic-ref", "HEAD", "refs/heads/managed-history"]);
    const refs = (
      await git(clone, ["for-each-ref", "--format=%(refname)"])
    ).split("\n");
    for (const ref of refs)
      if (ref !== "refs/heads/managed-history")
        await git(clone, ["update-ref", "-d", ref]);
    await git(clone, ["remote", "remove", "origin"]);
    await git(clone, ["reflog", "expire", "--expire=now", "--all"]);
    await git(clone, ["gc", "--prune=now"]);
    renameSync(path.join(directory, ".git"), retired);
    try {
      renameSync(path.join(clone, ".git"), path.join(directory, ".git"));
    } catch (error) {
      try {
        renameSync(retired, path.join(directory, ".git"));
      } catch {
        preserveRecovery = true;
        throw new Error(
          `History switch failed. Recovery repository retained at ${retired}`,
        );
      }
      throw error;
    }
    return {
      head: parent,
      removedVersions: revisions.length - retained.length,
    };
  } finally {
    if (!preserveRecovery) rmSync(temporary, { recursive: true, force: true });
  }
}
