import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Brief } from "./briefSchema.js";
import { researchDesignPatterns } from "./designResearchAgent.js";
import { candidateToBrief, createIdeaCandidates, selectDailyIdeas } from "./ideaCouncilAgent.js";
import { createLlmClient, type LlmProvider } from "./llmClient.js";
import { generateProject } from "./projectGenerator.js";
import { runQa } from "./qaAgent.js";
import { reviewBrief, reviewGeneratedProject, type ReviewResult } from "./reviewAgent.js";
import { researchTrends } from "./trendResearchAgent.js";

export type ProductionRobotOptions = {
  count?: number;
  provider?: LlmProvider;
  live?: boolean;
  dryRun?: boolean;
  replaceDaily?: boolean;
  force?: boolean;
  repoRoot?: string;
};

export type ProductionRobotResult = {
  briefs: Brief[];
  briefReviews: ReviewResult[];
  projectReviews: ReviewResult[];
  generatedProjectPaths: string[];
  qaOk: boolean;
};

export async function runProductionRobot(options: ProductionRobotOptions = {}): Promise<ProductionRobotResult> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const count = options.count ?? 4;
  const llm = createLlmClient(options.provider ?? "mock");
  const trends = await researchTrends({ live: options.live });
  const design = researchDesignPatterns();
  const candidates = await createIdeaCandidates(trends, design, llm);
  const selected = selectDailyIdeas(candidates, count);
  const briefs = selected.map(candidateToBrief);
  const briefReviews = briefs.map(reviewBrief);

  if (options.dryRun) {
    return { briefs, briefReviews, projectReviews: [], generatedProjectPaths: [], qaOk: true };
  }

  const dailyFolder = join(repoRoot, "factory", "briefs", "daily");
  mkdirSync(dailyFolder, { recursive: true });
  if (options.replaceDaily ?? true) {
    for (const file of readdirSync(dailyFolder).filter((name) => name.endsWith(".json"))) {
      rmSync(join(dailyFolder, file), { force: true });
    }
  }

  for (const brief of briefs) {
    writeFileSync(join(dailyFolder, brief.slug + ".json"), JSON.stringify(brief, null, 2) + "\n", "utf8");
  }

  const generatedProjectPaths = briefs.map((brief) => generateProject(brief, { repoRoot, force: options.force }).projectPath);
  const qa = runQa(repoRoot);
  const projectReviews = briefs
    .filter((brief) => existsSync(join(repoRoot, "factory", "generated-projects", brief.slug)))
    .map((brief) => reviewGeneratedProject(repoRoot, brief.slug));

  return { briefs, briefReviews, projectReviews, generatedProjectPaths, qaOk: qa.ok };
}

