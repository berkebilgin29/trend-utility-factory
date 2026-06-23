import type { ProductType } from "./briefSchema.js";

export type TrendSignal = {
  topic: string;
  demandSignal: string;
  sourceType: "offline-seed" | "public-web";
  source: string;
  keywords: string[];
  productTypes: ProductType[];
  risk: "low" | "medium";
};

export type TrendResearchOptions = {
  live?: boolean;
};

const blockedTerms = ["pos", "world cup", "game", "gaming", "fifa"];

const offlineSignals: TrendSignal[] = [
  {
    topic: "subscription audits",
    demandSignal: "People keep searching for ways to understand recurring streaming, app, and AI-tool costs.",
    sourceType: "offline-seed",
    source: "local seed: recurring expense and subscription cleanup demand",
    keywords: ["subscription cost tracker", "monthly subscription calculator", "streaming subscription cost"],
    productTypes: ["tracker", "calculator"],
    risk: "low"
  },
  {
    topic: "travel packing help",
    demandSignal: "Travelers want simple checklists tailored by trip length, weather, and travel type.",
    sourceType: "offline-seed",
    source: "local seed: travel planning and packing search demand",
    keywords: ["travel packing checklist", "packing list generator", "vacation packing checklist"],
    productTypes: ["checklist", "planner"],
    risk: "low"
  },
  {
    topic: "study planning",
    demandSignal: "Students need quick exam planning tools that turn dates and hours into a schedule.",
    sourceType: "offline-seed",
    source: "local seed: exam prep and study schedule demand",
    keywords: ["study plan generator", "exam study planner", "daily study schedule"],
    productTypes: ["planner", "generator"],
    risk: "low"
  },
  {
    topic: "phone installment comparison",
    demandSignal: "Phone buyers compare monthly payments, accessories, and total cost before upgrading.",
    sourceType: "offline-seed",
    source: "local seed: consumer electronics financing comparison demand",
    keywords: ["phone cost calculator", "monthly phone payment calculator", "phone installment calculator"],
    productTypes: ["calculator"],
    risk: "medium"
  },
  {
    topic: "AI tool choice overload",
    demandSignal: "Users are confused by too many AI tool categories and want task-fit guidance.",
    sourceType: "offline-seed",
    source: "local seed: AI workflow selection demand",
    keywords: ["AI tool quiz", "which AI tool should I use", "best AI tool for my task"],
    productTypes: ["quiz", "planner"],
    risk: "low"
  },
  {
    topic: "home energy habits",
    demandSignal: "People want simple calculators for appliance usage, seasonal bills, and habit changes.",
    sourceType: "offline-seed",
    source: "local seed: home budget and energy-saving demand",
    keywords: ["home energy calculator", "appliance cost calculator", "electricity usage estimator"],
    productTypes: ["calculator", "simulator"],
    risk: "medium"
  },
  {
    topic: "meal prep planning",
    demandSignal: "Busy users search for simple weekly meal prep and grocery planning workflows.",
    sourceType: "offline-seed",
    source: "local seed: weekly planning and grocery simplification demand",
    keywords: ["meal prep planner", "weekly meal plan generator", "grocery checklist"],
    productTypes: ["planner", "checklist"],
    risk: "low"
  },
  {
    topic: "remote work setup audit",
    demandSignal: "Workers compare focus, ergonomics, and tool setup as hybrid work stays common.",
    sourceType: "offline-seed",
    source: "local seed: remote work productivity demand",
    keywords: ["remote work checklist", "desk setup checklist", "home office planner"],
    productTypes: ["checklist", "quiz", "tier-list-maker"],
    risk: "low"
  }
];

const publicTrendUrls = [
  "https://news.google.com/rss/search?q=calculator%20planner%20checklist%20AI%20tools&hl=en-US&gl=US&ceid=US:en",
  "https://news.google.com/rss/search?q=budget%20subscription%20travel%20study%20planner&hl=en-US&gl=US&ceid=US:en"
];

export async function researchTrends(options: TrendResearchOptions = {}): Promise<TrendSignal[]> {
  const signals = [...offlineSignals];
  if (!options.live) return signals;

  for (const url of publicTrendUrls) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "trend-utility-factory-local-agent" } });
      if (!response.ok) continue;
      const text = await response.text();
      const titles = extractRssTitles(text).slice(0, 8);
      for (const title of titles) {
        const lower = title.toLowerCase();
        if (blockedTerms.some((term) => lower.includes(term))) continue;
        const keywords = inferKeywords(lower);
        if (keywords.length < 3) continue;
        signals.push({
          topic: title.slice(0, 80),
          demandSignal: "Public web headline suggests active user interest around " + keywords.join(", ") + ".",
          sourceType: "public-web",
          source: url,
          keywords,
          productTypes: inferProductTypes(lower),
          risk: lower.includes("money") || lower.includes("health") || lower.includes("legal") ? "medium" : "low"
        });
      }
    } catch {
      continue;
    }
  }

  return dedupeSignals(signals);
}

function extractRssTitles(xml: string): string[] {
  const matches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g)];
  return matches
    .map((match) => decodeXml(match[1] ?? match[2] ?? ""))
    .filter((title) => title && !title.toLowerCase().includes("google news"));
}

function inferKeywords(text: string): string[] {
  const seeds = [
    "calculator",
    "planner",
    "checklist",
    "generator",
    "quiz",
    "subscription",
    "travel",
    "study",
    "phone",
    "budget",
    "ai tool",
    "meal prep",
    "remote work"
  ];
  const found = seeds.filter((seed) => text.includes(seed));
  return found.length >= 3 ? found.slice(0, 5) : [];
}

function inferProductTypes(text: string): ProductType[] {
  if (text.includes("quiz")) return ["quiz"];
  if (text.includes("checklist")) return ["checklist"];
  if (text.includes("planner") || text.includes("plan")) return ["planner"];
  if (text.includes("calculator") || text.includes("cost") || text.includes("budget")) return ["calculator"];
  return ["generator"];
}

function dedupeSignals(signals: TrendSignal[]): TrendSignal[] {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = signal.topic.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

