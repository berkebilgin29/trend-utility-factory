import type { Brief, ProductType } from "./briefSchema.js";
import { briefSchema } from "./briefSchema.js";
import type { DesignResearchReport } from "./designResearchAgent.js";
import type { LlmClient } from "./llmClient.js";
import type { TrendSignal } from "./trendResearchAgent.js";

export type IdeaCandidate = {
  slug: string;
  productType: ProductType;
  title: string;
  keywords: string[];
  trendAngle: string;
  usefulness: number;
  trendFit: number;
  seoClarity: number;
  buildSimplicity: number;
  originalitySafety: number;
  notes: string;
};

const blockedTerms = ["pos", "world cup", "game", "gaming", "fifa"];

export async function createIdeaCandidates(signals: TrendSignal[], designReport: DesignResearchReport, llm: LlmClient): Promise<IdeaCandidate[]> {
  if (llm.provider !== "mock") {
    await llm.complete({
      temperature: 0.2,
      messages: [
        { role: "system", content: "You score utility app ideas. Return concise JSON only." },
        { role: "user", content: JSON.stringify({ signals: signals.slice(0, 8), designRules: designReport.rules }) }
      ]
    });
  }

  return signals
    .map(signalToCandidate)
    .filter((candidate) => !blockedTerms.some((term) => candidate.slug.includes(term)))
    .sort((a, b) => totalScore(b) - totalScore(a));
}

export function selectDailyIdeas(candidates: IdeaCandidate[], count: number): IdeaCandidate[] {
  const selected: IdeaCandidate[] = [];
  const usedTypes = new Set<ProductType>();

  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (usedTypes.has(candidate.productType) && selected.length < Math.min(count, 4)) continue;
    selected.push(candidate);
    usedTypes.add(candidate.productType);
  }

  for (const candidate of candidates) {
    if (selected.length >= count) break;
    if (!selected.some((item) => item.slug === candidate.slug)) selected.push(candidate);
  }

  return selected.slice(0, count);
}

export function candidateToBrief(candidate: IdeaCandidate): Brief {
  const brief = createBriefForCandidate(candidate);
  return briefSchema.parse(brief);
}

function signalToCandidate(signal: TrendSignal): IdeaCandidate {
  const productType = signal.productTypes[0] ?? "calculator";
  const title = toTitle(signal.topic, productType);
  const slug = slugify(title);
  const riskPenalty = signal.risk === "medium" ? 1 : 0;

  return {
    slug,
    productType,
    title,
    keywords: signal.keywords.slice(0, 5),
    trendAngle: signal.demandSignal,
    usefulness: 5,
    trendFit: signal.sourceType === "public-web" ? 5 : 4,
    seoClarity: Math.min(5, Math.max(3, signal.keywords.length)),
    buildSimplicity: productType === "calculator" || productType === "checklist" ? 5 : 4,
    originalitySafety: 5 - riskPenalty,
    notes: "Selected from " + signal.sourceType + " signal: " + signal.source
  };
}

function createBriefForCandidate(candidate: IdeaCandidate): Brief {
  const base = {
    slug: candidate.slug,
    productType: candidate.productType,
    title: candidate.title,
    description: descriptionFor(candidate),
    keywords: candidate.keywords,
    audience: audienceFor(candidate),
    trendAngle: candidate.trendAngle,
    features: featuresFor(candidate.productType),
    inputs: inputsFor(candidate.productType, candidate.title),
    outputs: outputsFor(candidate.productType),
    faq: faqFor(candidate),
    disclaimer: disclaimerFor(candidate)
  };
  return base;
}

function toTitle(topic: string, productType: ProductType): string {
  const cleanTopic = topic
    .replace(/help|demand|comparison|overload/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
  const suffix: Record<ProductType, string> = {
    calculator: "Calculator",
    generator: "Generator",
    checklist: "Checklist",
    tracker: "Tracker",
    simulator: "Simulator",
    planner: "Planner",
    quiz: "Quiz",
    converter: "Converter",
    "tier-list-maker": "Tier List Maker",
    "share-card-maker": "Share Card Maker"
  };
  return titleCase(cleanTopic) + " " + suffix[productType];
}

function descriptionFor(candidate: IdeaCandidate): string {
  return "Create a fast " + candidate.productType.replace(/-/g, " ") + " for " + candidate.keywords[0] + " with practical inputs, clear output, FAQ, and shareable results.";
}

function audienceFor(candidate: IdeaCandidate): string {
  return "General internet users searching for " + candidate.keywords.slice(0, 2).join(" or ");
}

function featuresFor(productType: ProductType): string[] {
  const shared = ["Mobile-ready layout", "Shareable result card"];
  if (productType === "calculator") return ["Clear input math", "Total estimate", ...shared];
  if (productType === "checklist") return ["Readiness checklist", "Missing item prompts", ...shared];
  if (productType === "planner") return ["Simple plan output", "Constraint summary", ...shared];
  if (productType === "quiz") return ["Task-fit questions", "Recommendation result", ...shared];
  if (productType === "tracker") return ["Local saved values", "Progress summary", ...shared];
  return ["Guided inputs", "Useful output", ...shared];
}

function inputsFor(productType: ProductType, title: string): Brief["inputs"] {
  if (productType === "checklist") {
    return [
      { id: "core-item", label: "Core item is ready", type: "checkbox", defaultValue: true },
      { id: "backup-item", label: "Backup item is ready", type: "checkbox", defaultValue: false },
      { id: "special-context", label: "Special context", type: "select", options: ["Standard", "Budget", "Time-sensitive", "Family"], defaultValue: "Standard" }
    ];
  }
  if (productType === "planner" || productType === "generator") {
    return [
      { id: "goal", label: title.replace(/ Planner| Generator/g, "") + " goal", type: "text", placeholder: "Enter the main goal" },
      { id: "days", label: "Days available", type: "number", defaultValue: 7 },
      { id: "priority", label: "Priority", type: "select", options: ["Balanced", "Fast", "Budget", "Detailed"], defaultValue: "Balanced" }
    ];
  }
  if (productType === "quiz") {
    return [
      { id: "task", label: "Main task", type: "select", options: ["Research", "Planning", "Writing", "Buying", "Organizing"], defaultValue: "Planning" },
      { id: "complexity", label: "Complexity from 1 to 10", type: "number", defaultValue: 5 },
      { id: "needs-speed", label: "Need a fast answer", type: "checkbox", defaultValue: true }
    ];
  }
  return [
    { id: "amount-one", label: "Primary amount", type: "number", defaultValue: 100 },
    { id: "amount-two", label: "Secondary amount", type: "number", defaultValue: 25 },
    { id: "time-period", label: "Time period", type: "number", defaultValue: 12 }
  ];
}

function outputsFor(productType: ProductType): Brief["outputs"] {
  if (productType === "checklist") return [{ id: "readiness", label: "Readiness score" }];
  if (productType === "planner") return [{ id: "plan", label: "Generated plan" }];
  if (productType === "quiz") return [{ id: "recommendation", label: "Recommendation" }];
  return [{ id: "result", label: "Calculated result" }, { id: "summary", label: "Summary" }];
}

function faqFor(candidate: IdeaCandidate): Brief["faq"] {
  return [
    {
      question: "Who is this " + candidate.productType.replace(/-/g, " ") + " for?",
      answer: "It is for people who want a quick, practical answer around " + candidate.keywords[0] + " without creating an account."
    },
    {
      question: "Does this use external APIs?",
      answer: "No. The generated utility runs in the browser and does not need paid services or external accounts."
    },
    {
      question: "How should I use the result?",
      answer: "Use it as a planning estimate or decision aid, then verify important details with official sources when needed."
    }
  ];
}

function disclaimerFor(candidate: IdeaCandidate): string {
  const sensitive = candidate.keywords.some((keyword) => /cost|budget|health|legal|payment|loan|finance/i.test(keyword));
  if (sensitive) return "This utility is for planning only and is not financial, legal, health, or official advice.";
  return "This utility is an informational planning aid. Verify important details before making decisions.";
}

function totalScore(candidate: IdeaCandidate): number {
  return candidate.usefulness + candidate.trendFit + candidate.seoClarity + candidate.buildSimplicity + candidate.originalitySafety;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function titleCase(value: string): string {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

