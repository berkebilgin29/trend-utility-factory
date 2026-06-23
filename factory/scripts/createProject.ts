import { loadBrief } from "../agents/briefSchema.js";
import { generateProject } from "../agents/projectGenerator.js";

const args = process.argv.slice(2);
const briefPath = args.find((arg) => !arg.startsWith("--"));
const force = args.includes("--force");

if (!briefPath) {
  console.error("Usage: npm.cmd run create:project -- <brief.json> [--force]");
  process.exit(1);
}

const result = generateProject(loadBrief(briefPath), { force });
console.log((result.skipped ? "Skipped existing project: " : "Generated project: ") + result.projectPath);

