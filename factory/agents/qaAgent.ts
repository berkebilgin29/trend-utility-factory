import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { briefSchema } from "./briefSchema.js";

export type QaIssue = {
  level: "error" | "warning";
  message: string;
};

export type QaResult = {
  ok: boolean;
  issues: QaIssue[];
};

const requiredFolders = [
  "factory/templates/calculator",
  "factory/templates/generator",
  "factory/templates/checklist",
  "factory/templates/tracker",
  "factory/templates/simulator",
  "factory/templates/planner",
  "factory/templates/quiz",
  "factory/templates/converter",
  "factory/templates/tier-list",
  "factory/templates/share-card",
  "factory/components",
  "factory/seo",
  "factory/scripts",
  "factory/briefs/daily",
  "factory/generated-projects",
  "factory/agents",
  "factory/docs",
  "datasets/successful-projects",
  "datasets/failed-projects",
  "datasets/seo-performance",
  "datasets/build-errors",
  "datasets/codex-fixes"
];

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "AGENTS.md",
  "factory/agents/llmClient.ts",
  "factory/agents/briefAgent.ts",
  "factory/agents/seoAgent.ts",
  "factory/agents/templateSelector.ts",
  "factory/agents/projectGenerator.ts",
  "factory/agents/qaAgent.ts"
];

const generatedRequiredFiles = [
  "package.json",
  "README.md",
  "index.html",
  "src/App.tsx",
  "src/main.tsx",
  "src/styles.css",
  "vite.config.ts",
  "tsconfig.json",
  "postcss.config.js",
  "tailwind.config.js",
  "public/sitemap.xml",
  "public/robots.txt"
];

export function runQa(repoRoot = process.cwd()): QaResult {
  const issues: QaIssue[] = [];

  for (const folder of requiredFolders) {
    const fullPath = join(repoRoot, folder);
    if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
      issues.push({ level: "error", message: "Missing folder: " + folder });
    }
  }

  for (const file of requiredFiles) {
    const fullPath = join(repoRoot, file);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) {
      issues.push({ level: "error", message: "Missing file: " + file });
    }
  }

  validateBriefs(join(repoRoot, "factory", "briefs"), issues);
  validateGeneratedProjects(join(repoRoot, "factory", "generated-projects"), issues);

  return {
    ok: !issues.some((issue) => issue.level === "error"),
    issues
  };
}

function validateBriefs(folder: string, issues: QaIssue[]): void {
  if (!existsSync(folder)) return;
  for (const file of listJsonFiles(folder)) {
    try {
      briefSchema.parse(JSON.parse(readFileSync(file, "utf8")));
    } catch (error) {
      issues.push({ level: "error", message: "Invalid brief: " + file + " - " + formatError(error) });
    }
  }
}

function validateGeneratedProjects(folder: string, issues: QaIssue[]): void {
  if (!existsSync(folder)) return;
  const projectFolders = readdirSync(folder)
    .map((name) => join(folder, name))
    .filter((path) => statSync(path).isDirectory());

  for (const projectFolder of projectFolders) {
    for (const file of generatedRequiredFiles) {
      const fullPath = join(projectFolder, file);
      if (!existsSync(fullPath)) {
        issues.push({ level: "error", message: "Generated project missing " + file + ": " + projectFolder });
      }
    }
  }
}

function listJsonFiles(folder: string): string[] {
  const entries = readdirSync(folder, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(folder, entry.name);
    if (entry.isDirectory()) return listJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".json") ? [fullPath] : [];
  });
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

