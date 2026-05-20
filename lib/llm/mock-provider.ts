import type { LLMResponse, ModelCallParams, ModelProviderAdapter } from "@/lib/llm/types";

export class MockProviderAdapter implements ModelProviderAdapter {
  async call(params: ModelCallParams): Promise<LLMResponse> {
    const start = performance.now();
    const userMessage =
      [...params.messages].reverse().find((message) => message.role === "user")?.content ?? "";
    const summary = createSummary(userMessage);
    const content = JSON.stringify(
      {
        summary,
        decision: userMessage.toLowerCase().includes("risk") ? "needs_review" : "ship",
        confidence: 0.86,
        category: inferCategory(userMessage)
      },
      null,
      2
    );
    const inputTokens = estimateTokens(params.messages.map((message) => message.content).join("\n"));
    const outputTokens = estimateTokens(content);

    return {
      content,
      raw: {
        provider: "mock",
        model: params.modelName,
        message: content
      },
      latencyMs: Math.max(1, Math.round(performance.now() - start)),
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      cost: 0
    };
  }
}

function createSummary(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact || "No input provided";
}

function inferCategory(value: string): string {
  const lower = value.toLowerCase();
  if (lower.includes("json")) return "structured-output";
  if (lower.includes("risk") || lower.includes("安全")) return "risk";
  if (lower.includes("intent") || lower.includes("意图")) return "intent";
  return "general";
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}
