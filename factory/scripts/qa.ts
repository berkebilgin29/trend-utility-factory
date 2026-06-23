import { runQa } from "../agents/qaAgent.js";

const result = runQa();
if (result.issues.length === 0) {
  console.log("QA passed. No issues found.");
} else {
  for (const issue of result.issues) {
    console.log(issue.level.toUpperCase() + ": " + issue.message);
  }
}

if (!result.ok) {
  process.exit(1);
}

