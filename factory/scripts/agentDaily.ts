import { runProductionRobot } from "../agents/productionRobot.js";
import type { LlmProvider } from "../agents/llmClient.js";

const args = process.argv.slice(2);
const result = await runProductionRobot({
  count: Number(readOption("--count", "4")),
  provider: readOption("--provider", "mock") as LlmProvider,
  live: args.includes("--live"),
  dryRun: args.includes("--dry-run"),
  replaceDaily: !args.includes("--append"),
  force: args.includes("--force")
});

console.log("Briefs:");
for (const brief of result.briefs) {
  console.log("- " + brief.slug + " (" + brief.productType + ")");
}

console.log("Brief reviews:");
for (const review of result.briefReviews) {
  console.log("- " + review.slug + " score=" + review.score + " passed=" + review.passed + formatFindings(review.findings));
}

if (result.generatedProjectPaths.length > 0) {
  console.log("Generated projects:");
  for (const projectPath of result.generatedProjectPaths) console.log("- " + projectPath);
  console.log("Project reviews:");
  for (const review of result.projectReviews) {
    console.log("- " + review.slug + " score=" + review.score + " passed=" + review.passed + formatFindings(review.findings));
  }
  console.log("QA: " + (result.qaOk ? "passed" : "failed"));
}

if (!result.qaOk) process.exit(1);

function readOption(name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

function formatFindings(findings: string[]): string {
  return findings.length ? " findings=" + findings.join("; ") : "";
}

