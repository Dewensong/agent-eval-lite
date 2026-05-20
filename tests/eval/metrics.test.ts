import { describe, expect, it } from "vitest";
import { aggregateEvalMetrics } from "@/lib/eval/metrics";
import type { EvalResult } from "@/types/evaluation";

const resultBase = {
  evalRunId: "run-1",
  testCaseId: "case-1",
  promptVersionId: "pv-1",
  modelProviderId: "provider-1",
  input: { input: "hello" },
  expected: null,
  actualOutput: "ok",
  rawOutput: "ok",
  error: null,
  createdAt: "2026-05-20T00:00:00.000Z"
};

describe("metrics aggregation", () => {
  it("aggregates success, json/schema rates, latency, tokens and cost", () => {
    const metrics = aggregateEvalMetrics([
      {
        ...resultBase,
        id: "r1",
        pass: true,
        latencyMs: 100,
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
        cost: 0.01,
        assertionResults: [
          { assertionId: "json", type: "is-json", pass: true, score: 1, reason: "ok" },
          {
            assertionId: "schema",
            type: "json-schema",
            pass: true,
            score: 1,
            reason: "ok"
          }
        ]
      },
      {
        ...resultBase,
        id: "r2",
        pass: false,
        latencyMs: 300,
        inputTokens: 20,
        outputTokens: 20,
        totalTokens: 40,
        cost: 0.03,
        assertionResults: [
          { assertionId: "json", type: "is-json", pass: false, score: 0, reason: "bad" },
          {
            assertionId: "schema",
            type: "json-schema",
            pass: false,
            score: 0,
            reason: "bad"
          }
        ]
      }
    ] satisfies EvalResult[]);

    expect(metrics).toMatchObject({
      totalCases: 2,
      passedCases: 1,
      failedCases: 1,
      successRate: 0.5,
      jsonValidRate: 0.5,
      schemaPassRate: 0.5,
      avgLatencyMs: 200,
      avgTokens: 35,
      avgCost: 0.02
    });
  });
});
