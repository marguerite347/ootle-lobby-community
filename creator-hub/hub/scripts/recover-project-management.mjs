// Run locally as the storage administrator. Never expose recovery as a public endpoint.
import { existsSync } from "node:fs";
import path from "node:path";
import { projectsDir } from "../server/paths.mjs";
import { issueManagementKey } from "../server/projectManagement.mjs";
import { isValidId } from "../server/projects.mjs";
const id = process.argv[2];
if (!isValidId(id) || !existsSync(path.join(projectsDir, id, "project.json")))
  throw Error("Existing project ID required");
console.log(issueManagementKey(id));
