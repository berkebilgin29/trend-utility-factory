import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type StageProvider =
  | "local-agent"
  | "local-agent-live"
  | "ollama"
  | "chatgpt-manual"
  | "gemini-manual"
  | "chatgpt-gemini-manual"
  | "local-pattern-library"
  | "factory-cli";

export type PanelConfig = {
  dailyCount: number;
  selectedProjectSlug: string;
  automation: {
    enabled: boolean;
    time: string;
    count: number;
    provider: "mock" | "ollama";
    liveResearch: boolean;
    buildAfterGenerate: boolean;
  };
  stages: {
    trendResearch: StageProvider;
    designResearch: StageProvider;
    ideaCouncil: StageProvider;
    productionRobot: StageProvider;
    review: StageProvider;
  };
  tokenEstimates: {
    averageIdeaCouncilTokens: number;
    averageReviewTokensPerProject: number;
    averageDesignPromptTokens: number;
  };
};

const configPath = join(process.cwd(), "factory", "panel", "panel-config.json");

export const defaultPanelConfig: PanelConfig = {
  dailyCount: 4,
  selectedProjectSlug: "phone-total-cost-calculator",
  automation: {
    enabled: true,
    time: "09:00",
    count: 4,
    provider: "ollama",
    liveResearch: false,
    buildAfterGenerate: true
  },
  stages: {
    trendResearch: "local-agent",
    designResearch: "local-pattern-library",
    ideaCouncil: "chatgpt-gemini-manual",
    productionRobot: "factory-cli",
    review: "chatgpt-gemini-manual"
  },
  tokenEstimates: {
    averageIdeaCouncilTokens: 2600,
    averageReviewTokensPerProject: 1800,
    averageDesignPromptTokens: 1200
  }
};

export function readPanelConfig(): PanelConfig {
  if (!existsSync(configPath)) return defaultPanelConfig;
  try {
    return { ...defaultPanelConfig, ...JSON.parse(readFileSync(configPath, "utf8")) };
  } catch {
    return defaultPanelConfig;
  }
}

export function writePanelConfig(config: PanelConfig): void {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export function estimateTokens(config: PanelConfig) {
  const externalIdeaTokens = usesManualExternal(config.stages.ideaCouncil) ? config.tokenEstimates.averageIdeaCouncilTokens : 0;
  const externalReviewTokens = usesManualExternal(config.stages.review)
    ? config.tokenEstimates.averageReviewTokensPerProject * config.dailyCount
    : 0;
  const externalDesignTokens = usesManualExternal(config.stages.designResearch) ? config.tokenEstimates.averageDesignPromptTokens : 0;
  const totalExternalTokens = externalIdeaTokens + externalReviewTokens + externalDesignTokens;

  return {
    totalExternalTokens,
    averageExternalTokensPerProject: Math.round(totalExternalTokens / Math.max(1, config.dailyCount)),
    localTokens: usesOllama(config) ? Math.round((config.dailyCount * 1400 + 2200) / 100) * 100 : 0,
    paidApiTokens: 0,
    note: "Varsayilan panel modu ucretli API cagrisi yapmaz. ChatGPT/Gemini asamalari, ileride acik API baglantisi eklenene kadar manuel kopyala-yapistir token tahminidir."
  };
}

function usesManualExternal(provider: StageProvider): boolean {
  return provider === "chatgpt-manual" || provider === "gemini-manual" || provider === "chatgpt-gemini-manual";
}

function usesOllama(config: PanelConfig): boolean {
  return config.automation.provider === "ollama" || Object.values(config.stages).includes("ollama");
}
