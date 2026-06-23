import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadBrief } from "../agents/briefSchema.js";
import { generateProject } from "../agents/projectGenerator.js";

const args = process.argv.slice(2);
const folder = args.find((arg) => !arg.startsWith("--"));
const force = args.includes("--force");

if (!folder) {
  console.error("Usage: npm.cmd run create:batch -- <brief-folder> [--force]");
  process.exit(1);
}

const files = readdirSync(folder)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => join(folder, file))
  .filter((file) => statSync(file).isFile());

const results = files.map((file) => generateProject(loadBrief(file), { force }));
for (const result of results) {
  console.log((result.skipped ? "skipped " : "generated ") + result.projectPath);
}
console.log("Batch complete. Generated: " + results.filter((result) => !result.skipped).length + ", skipped: " + results.filter((result) => result.skipped).length);

