export type ModelMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ModelCallParams = {
  providerId: string;
  modelName: string;
  baseUrl: string;
  apiKey: string;
  messages: ModelMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  pricingInputPer1M?: number;
  pricingOutputPer1M?: number;
};

export type LLMResponse = {
  content: string;
  raw: unknown;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  error?: string;
};

export interface ModelProviderAdapter {
  call(params: ModelCallParams): Promise<LLMResponse>;
}
