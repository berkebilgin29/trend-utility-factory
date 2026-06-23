import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Brief } from "./briefSchema.js";

export type TemplateSelection = {
  templateName: string;
  templatePath: string;
};

const templateMap: Record<Brief["productType"], string> = {
  calculator: "calculator",
  generator: "generator",
  checklist: "checklist",
  tracker: "tracker",
  simulator: "simulator",
  planner: "planner",
  quiz: "quiz",
  converter: "converter",
  "tier-list-maker": "tier-list",
  "share-card-maker": "share-card"
};

export function selectTemplate(brief: Brief, repoRoot = process.cwd()): TemplateSelection {
  const templateName = templateMap[brief.productType];
  const templatePath = join(repoRoot, "factory", "templates", templateName);
  if (!existsSync(templatePath)) {
    throw new Error("Template folder missing for " + brief.productType + ": " + templatePath);
  }
  return { templateName, templatePath };
}

