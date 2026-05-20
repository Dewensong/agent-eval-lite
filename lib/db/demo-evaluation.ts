import { demoAssertions, demoDataset, demoPromptVersion, demoProvider } from "@/lib/db/demo-data";
import { runDatasetEvaluation } from "@/lib/eval/runner";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";

export async function getDemoEvaluationSnapshot() {
  return runDatasetEvaluation({
    name: "AgentEval Lite Mock Baseline",
    promptVersion: demoPromptVersion,
    provider: demoProvider,
    dataset: demoDataset,
    assertions: demoAssertions,
    adapter: new MockProviderAdapter()
  });
}
