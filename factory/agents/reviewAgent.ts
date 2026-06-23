import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Brief } from "./briefSchema.js";
import { briefSchema } from "./briefSchema.js";

export type ReviewResult = {
  slug: string;
  score: number;
  passed: boolean;
  findings: string[];
};

export function reviewBrief(brief: Brief): ReviewResult {
  const findings: string[] = [];
  const blocked = ["pos", "world cup", "game", "gaming", "fifa"];
  const text = JSON.stringify(brief).toLowerCase();

  if (blocked.some((term) => text.includes(term))) findings.push("Contains blocked topic language.");
  if (brief.keywords.length < 3) findings.push("Needs at least three focused keywords.");
  if (brief.faq.length < 3) findings.push("Prefer at least three FAQ items for deploy review.");
  if (!brief.disclaimer.toLowerCase().includes("advice") && /cost|health|legal|payment|loan|finance/i.test(text)) {
    findings.push("Sensitive topic should include an advice disclaimer.");
  }
  if (brief.inputs.length < 2) findings.push("Needs enough inputs to produce a useful result.");
  if (brief.description.length < 50) findings.push("Description is too thin for SEO intent.");

  const score = Math.max(0, 100 - findings.length * 15);
  return { slug: brief.slug, score, passed: score >= 70, findings };
}

export function reviewGeneratedProject(repoRoot: string, slug: string): ReviewResult {
  const projectPath = join(repoRoot, "factory", "generated-projects", slug);
  const findings: string[] = [];
  const required = ["index.html", "README.md", "src/App.tsx", "public/sitemap.xml", "public/robots.txt"];

  for (const file of required) {
    if (!existsSync(join(projectPath, file))) findings.push("Missing " + file);
  }

  const appPath = join(projectPath, "src", "App.tsx");
  const htmlPath = join(projectPath, "index.html");
  const readmePath = join(projectPath, "README.md");

  const app = existsSync(appPath) ? readFileSync(appPath, "utf8") : "";
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";

  if (!html.includes("<meta name=\"description\"")) findings.push("Missing meta description.");
  if (!app.includes("application/ld+json")) findings.push("Missing JSON-LD script.");
  if (!app.includes("FAQ")) findings.push("Missing visible FAQ section.");
  if (!/disclaimer|advice|verify/i.test(app)) findings.push("Missing visible disclaimer language.");
  if (!readme.includes("npm.cmd run build")) findings.push("README missing Windows build command.");

  const score = Math.max(0, 100 - findings.length * 15);
  return { slug, score, passed: score >= 70, findings };
}

export function loadBriefForReview(path: string): Brief {
  return briefSchema.parse(JSON.parse(readFileSync(path, "utf8")));
}

