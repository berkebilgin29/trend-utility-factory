import { researchDesignPatterns } from "../agents/designResearchAgent.js";
import { createIdeaCandidates, selectDailyIdeas } from "../agents/ideaCouncilAgent.js";
import { createLlmClient, type LlmProvider } from "../agents/llmClient.js";
import { researchTrends } from "../agents/trendResearchAgent.js";

const args = process.argv.slice(2);
const live = args.includes("--live");
const provider = readOption("--provider", "mock") as LlmProvider;
const count = Number(readOption("--count", "8"));

const trends = await researchTrends({ live });
const design = researchDesignPatterns();
const candidates = await createIdeaCandidates(trends, design, createLlmClient(provider));
const selected = selectDailyIdeas(candidates, count);

console.log("Trend signals: " + trends.length);
console.log("Design patterns: " + design.patterns.length);
for (const idea of selected) {
  console.log([idea.slug, idea.productType, idea.keywords.join(", "), "score=" + (idea.usefulness + idea.trendFit + idea.seoClarity + idea.buildSimplicity + idea.originalitySafety)].join(" | "));
}

function readOption(name: string, fallback: string): string {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? fallback : fallback;
}

