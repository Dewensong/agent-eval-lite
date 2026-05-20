import type { LLMResponse, ModelCallParams, ModelProviderAdapter } from "@/lib/llm/types";

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
};

export class OpenAICompatibleAdapter implements ModelProviderAdapter {
  async call(params: ModelCallParams): Promise<LLMResponse> {
    const start = performance.now();

    if (!params.apiKey) {
      return {
        content: "",
        raw: null,
        latencyMs: 0,
        error: "OpenAI-compatible provider requires an API key"
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 60000);

    try {
      const response = await fetch(`${params.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: params.modelName,
          messages: params.messages,
          temperature: params.temperature ?? 0.2,
          max_tokens: params.maxTokens ?? 1200
        }),
        signal: controller.signal
      });
      const raw = (await response.json()) as OpenAICompatibleResponse;
      const latencyMs = Math.round(performance.now() - start);

      if (!response.ok) {
        return {
          content: "",
          raw,
          latencyMs,
          error: raw.error?.message ?? `Provider request failed with status ${response.status}`
        };
      }

      const content = raw.choices?.[0]?.message?.content ?? "";
      const inputTokens = raw.usage?.prompt_tokens;
      const outputTokens = raw.usage?.completion_tokens;
      const totalTokens = raw.usage?.total_tokens;

      return {
        content,
        raw,
        latencyMs,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: estimateCost(params, inputTokens, outputTokens)
      };
    } catch (error) {
      return {
        content: "",
        raw: null,
        latencyMs: Math.round(performance.now() - start),
        error: error instanceof Error ? error.message : "Provider request failed"
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function estimateCost(
  params: ModelCallParams,
  inputTokens = 0,
  outputTokens = 0
): number | undefined {
  if (!params.pricingInputPer1M && !params.pricingOutputPer1M) {
    return undefined;
  }

  const inputCost = (inputTokens / 1_000_000) * (params.pricingInputPer1M ?? 0);
  const outputCost = (outputTokens / 1_000_000) * (params.pricingOutputPer1M ?? 0);
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
