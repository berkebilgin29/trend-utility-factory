import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createDailyMockBriefs } from "../agents/briefAgent.js";
import { generateProject } from "../agents/projectGenerator.js";
import { runQa } from "../agents/qaAgent.js";

const dailyFolder = join("factory", "briefs", "daily");
mkdirSync(dailyFolder, { recursive: true });

const briefs = createDailyMockBriefs();
for (const brief of briefs) {
  const briefPath = join(dailyFolder, brief.slug + ".json");
  writeFileSync(briefPath, JSON.stringify(brief, null, 2) + "\n", "utf8");
  const result = generateProject(brief);
  console.log((result.skipped ? "skipped " : "generated ") + result.projectPath);
}

const qa = runQa();
console.log("QA summary: " + (qa.ok ? "passed" : "failed") + " with " + qa.issues.length + " issue(s).");
for (const issue of qa.issues) {
  console.log(issue.level.toUpperCase() + ": " + issue.message);
}

if (!qa.ok) {
  process.exit(1);
}

