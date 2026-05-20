import { describe, expect, it } from "vitest";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";
import { OpenAICompatibleAdapter } from "@/lib/llm/openai-compatible";

describe("llm providers", () => {
  it("returns deterministic json from mock provider", async () => {
    const provider = new MockProviderAdapter();
    const result = await provider.call({
      providerId: "mock",
      modelName: "mock-json",
      baseUrl: "mock://local",
      apiKey: "",
      messages: [{ role: "user", content: "Summarize this" }],
      temperature: 0,
      maxTokens: 200
    });

    expect(result.content).toContain("summary");
    expect(result.error).toBeUndefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns a structured error when openai-compatible adapter lacks api key", async () => {
    const provider = new OpenAICompatibleAdapter();
    const result = await provider.call({
      providerId: "openai",
      modelName: "gpt-compatible",
      baseUrl: "https://example.com/v1",
      apiKey: "",
      messages: [{ role: "user", content: "Hello" }]
    });

    expect(result.content).toBe("");
    expect(result.error).toContain("API key");
  });
});
