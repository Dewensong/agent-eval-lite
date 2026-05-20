import { describe, expect, it } from "vitest";
import { demoAssertions, demoDataset, demoPromptVersion, demoProvider } from "@/lib/db/demo-data";
import { runDatasetEvaluation } from "@/lib/eval/runner";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";

describe("evaluation runner", () => {
  it("runs a dataset through the mock provider and computes summary metrics", async () => {
    const run = await runDatasetEvaluation({
      name: "Mock smoke eval",
      promptVersion: demoPromptVersion,
      provider: demoProvider,
      dataset: demoDataset,
      assertions: demoAssertions,
      adapter: new MockProviderAdapter()
    });

    expect(run.results).toHaveLength(demoDataset.testCases.length);
    expect(run.evalRun.summaryMetrics.totalCases).toBe(demoDataset.testCases.length);
    expect(run.evalRun.summaryMetrics.successRate).toBeGreaterThan(0);
    expect(run.traces).toHaveLength(demoDataset.testCases.length);
  });
});
