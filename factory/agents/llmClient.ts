export type LlmProvider = "mock" | "ollama" | "openai-compatible";

export type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  messages: LlmMessage[];
  model?: string;
  temperature?: number;
};

export type LlmClient = {
  provider: LlmProvider;
  complete(request: LlmRequest): Promise<string>;
};

export function createLlmClient(provider: LlmProvider = "mock"): LlmClient {
  if (provider === "ollama") {
    return {
      provider,
      async complete(request) {
        const response = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: request.model ?? "llama3.1",
            messages: request.messages,
            stream: false,
            options: { temperature: request.temperature ?? 0.3 }
          })
        });
        if (!response.ok) {
          throw new Error("Ollama request failed with status " + response.status);
        }
        const json = (await response.json()) as { message?: { content?: string } };
        return json.message?.content ?? "";
      }
    };
  }

  if (provider === "openai-compatible") {
    return {
      provider,
      async complete() {
        throw new Error("openai-compatible provider is prepared but not configured. Add a local endpoint and API key handling before use.");
      }
    };
  }

  return {
    provider: "mock",
    async complete(request) {
      const latestUser = [...request.messages].reverse().find((message) => message.role === "user");
      return JSON.stringify({
        provider: "mock",
        note: "Deterministic local response. No external API was called.",
        prompt: latestUser?.content ?? ""
      });
    }
  };
}

