import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { reviewGeneratedProject } from "../agents/reviewAgent.js";

const args = process.argv.slice(2);
const generatedRoot = join(process.cwd(), "factory", "generated-projects");
const slug = args[0];
const slugs = slug
  ? [slug]
  : readdirSync(generatedRoot)
      .filter((name) => statSync(join(generatedRoot, name)).isDirectory())
      .sort();

for (const item of slugs) {
  const review = reviewGeneratedProject(process.cwd(), item);
  console.log(item + " score=" + review.score + " passed=" + review.passed);
  for (const finding of review.findings) console.log("- " + finding);
}

