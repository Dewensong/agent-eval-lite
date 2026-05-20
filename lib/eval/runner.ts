import { runAssertions } from "@/lib/eval/assertions";
import { aggregateEvalMetrics } from "@/lib/eval/metrics";
import { renderPromptTemplate } from "@/lib/eval/prompt";
import type { ModelProviderAdapter } from "@/lib/llm/types";
import type { Assertion } from "@/types/assertion";
import type { Dataset } from "@/types/dataset";
import type { EvalResult, EvalRun, RunTrace } from "@/types/evaluation";
import type { PromptVersion } from "@/types/prompt";
import type { ModelProvider } from "@/types/provider";

export type RunDatasetEvaluationInput = {
  name: string;
  promptVersion: PromptVersion;
  provider: ModelProvider;
  dataset: Dataset;
  assertions: Assertion[];
  adapter: ModelProviderAdapter;
};

export type RunDatasetEvaluationOutput = {
  evalRun: EvalRun;
  results: EvalResult[];
  traces: RunTrace[];
};

export async function runDatasetEvaluation(
  input: RunDatasetEvaluationInput
): Promise<RunDatasetEvaluationOutput> {
  const now = new Date().toISOString();
  const evalRunId = makeId("run");
  const results: EvalResult[] = [];
  const traces: RunTrace[] = [];

  for (const testCase of input.dataset.testCases.slice(0, 100)) {
    const rendered = renderPromptTemplate(input.promptVersion.userTemplate, testCase.inputVars);
    const renderedPrompt = rendered.rendered;
    const resultId = makeId("result");

    if (rendered.missingVariables.length > 0) {
      const error = `Missing variables: ${rendered.missingVariables.join(", ")}`;
      const result = createFailedResult({
        id: resultId,
        evalRunId,
        testCaseId: testCase.id,
        promptVersionId: input.promptVersion.id,
        modelProviderId: input.provider.id,
        input: testCase.inputVars,
        expected: testCase.expectedOutput ?? null,
        actualOutput: "",
        rawOutput: "",
        error
      });
      results.push(result);
      traces.push(
        createTrace({
          evalRunId,
          evalResultId: result.id,
          testCaseId: testCase.id,
          systemPrompt: input.promptVersion.systemPrompt,
          userPrompt: input.promptVersion.userTemplate,
          renderedPrompt,
          request: { skipped: true },
          error,
          latencyMs: 0
        })
      );
      continue;
    }

    const response = await input.adapter.call({
      providerId: input.provider.id,
      modelName: input.provider.modelName,
      baseUrl: input.provider.baseUrl,
      apiKey: process.env[input.provider.apiKeyEnvName ?? ""] ?? "",
      messages: [
        { role: "system", content: input.promptVersion.systemPrompt },
        { role: "user", content: renderedPrompt }
      ],
      temperature: input.provider.defaultTemperature,
      maxTokens: input.provider.defaultMaxTokens,
      pricingInputPer1M: input.provider.pricingInputPer1M,
      pricingOutputPer1M: input.provider.pricingOutputPer1M
    });

    const assertionResults = response.error
      ? []
      : runAssertions({
          assertions: input.assertions,
          actualOutput: response.content,
          expectedOutput: testCase.expectedOutput ?? null,
          latencyMs: response.latencyMs,
          cost: response.cost
        });
    const pass = !response.error && assertionResults.every((assertion) => assertion.pass);

    const result: EvalResult = {
      id: resultId,
      evalRunId,
      testCaseId: testCase.id,
      promptVersionId: input.promptVersion.id,
      modelProviderId: input.provider.id,
      input: testCase.inputVars,
      expected: testCase.expectedOutput ?? null,
      actualOutput: response.content,
      rawOutput: response.content,
      pass,
      assertionResults,
      latencyMs: response.latencyMs,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      cost: response.cost,
      error: response.error ?? null,
      createdAt: now
    };
    results.push(result);
    traces.push(
      createTrace({
        evalRunId,
        evalResultId: result.id,
        testCaseId: testCase.id,
        systemPrompt: input.promptVersion.systemPrompt,
        userPrompt: input.promptVersion.userTemplate,
        renderedPrompt,
        request: {
          provider: input.provider.name,
          model: input.provider.modelName,
          temperature: input.provider.defaultTemperature
        },
        response: response.raw,
        error: response.error ?? null,
        latencyMs: response.latencyMs,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        totalTokens: response.totalTokens,
        cost: response.cost
      })
    );
  }

  const finishedAt = new Date().toISOString();
  return {
    evalRun: {
      id: evalRunId,
      name: input.name,
      promptVersionId: input.promptVersion.id,
      modelProviderId: input.provider.id,
      datasetId: input.dataset.id,
      assertionIds: input.assertions.map((assertion) => assertion.id),
      status: results.some((result) => result.error) ? "failed" : "completed",
      summaryMetrics: aggregateEvalMetrics(results),
      startedAt: now,
      finishedAt,
      createdAt: now,
      updatedAt: finishedAt
    },
    results,
    traces
  };
}

function createFailedResult(input: {
  id: string;
  evalRunId: string;
  testCaseId: string;
  promptVersionId: string;
  modelProviderId: string;
  input: Record<string, import("@/types/common").JsonValue>;
  expected: import("@/types/common").JsonValue | null;
  actualOutput: string;
  rawOutput: string;
  error: string;
}): EvalResult {
  return {
    ...input,
    pass: false,
    assertionResults: [],
    latencyMs: 0,
    cost: 0,
    createdAt: new Date().toISOString()
  };
}

function createTrace(input: {
  evalRunId: string;
  evalResultId: string;
  testCaseId: string;
  systemPrompt: string;
  userPrompt: string;
  renderedPrompt: string;
  request: unknown;
  response?: unknown;
  error: string | null;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
}): RunTrace {
  return {
    id: makeId("trace"),
    evalRunId: input.evalRunId,
    evalResultId: input.evalResultId,
    testCaseId: input.testCaseId,
    prompt: {
      systemPrompt: input.systemPrompt,
      userPrompt: input.userPrompt,
      renderedPrompt: input.renderedPrompt
    },
    request: input.request,
    response: input.response,
    error: input.error,
    latencyMs: input.latencyMs,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    cost: input.cost,
    createdAt: new Date().toISOString()
  };
}

function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
