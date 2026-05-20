import type { EvalResult, SummaryMetrics } from "@/types/evaluation";

export function aggregateEvalMetrics(results: EvalResult[]): SummaryMetrics {
  const totalCases = results.length;
  const passedCases = results.filter((result) => result.pass).length;
  const failedCases = totalCases - passedCases;

  return {
    totalCases,
    passedCases,
    failedCases,
    successRate: rate(passedCases, totalCases),
    jsonValidRate: assertionRate(results, "is-json"),
    schemaPassRate: assertionRate(results, "json-schema"),
    avgLatencyMs: average(results.map((result) => result.latencyMs)),
    avgTokens: average(results.map((result) => result.totalTokens ?? 0)),
    avgCost: average(results.map((result) => result.cost ?? 0))
  };
}

function assertionRate(results: EvalResult[], type: string): number {
  if (results.length === 0) {
    return 0;
  }

  const passed = results.filter((result) =>
    result.assertionResults.some((assertion) => assertion.type === type && assertion.pass)
  ).length;

  return rate(passed, results.length);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return round(total / values.length);
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round(numerator / denominator);
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
