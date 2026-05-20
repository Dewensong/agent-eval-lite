"use client";

import { useState } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoAssertions, demoDataset, demoPromptVersion, demoProvider } from "@/lib/db/demo-data";
import { runDatasetEvaluation, type RunDatasetEvaluationOutput } from "@/lib/eval/runner";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";
import { formatCost, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";

export function EvaluationRunPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [snapshot, setSnapshot] = useState<RunDatasetEvaluationOutput | null>(null);

  async function startRun() {
    setStatus("running");
    const nextSnapshot = await runDatasetEvaluation({
      name: "Manual mock eval run",
      promptVersion: demoPromptVersion,
      provider: demoProvider,
      dataset: demoDataset,
      assertions: demoAssertions,
      adapter: new MockProviderAdapter()
    });
    setSnapshot(nextSnapshot);
    setStatus("done");
  }

  const metrics = snapshot?.evalRun.summaryMetrics;

  return (
    <AppShell active="/evaluations">
      <MobileNav />
      <PageHeader
        title="Evaluation Run"
        description="Select a prompt version, provider, dataset and assertion pack, then run a cost-safe batch evaluation."
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Run setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SetupRow label="Prompt version" value={`${demoPromptVersion.id} · v${demoPromptVersion.version}`} />
            <SetupRow label="Provider" value={`${demoProvider.name} · ${demoProvider.modelName}`} />
            <SetupRow label="Dataset" value={`${demoDataset.name} · ${demoDataset.testCases.length} cases`} />
            <SetupRow label="Assertions" value={`${demoAssertions.length} rule checks`} />
            <Button className="w-full" disabled={status === "running"} onClick={startRun} variant="accent">
              {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {status === "running" ? "Running mock eval" : "Start batch run"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Run output</CardTitle>
            <Badge tone={status === "done" ? "success" : status === "running" ? "warning" : "neutral"}>
              {status}
            </Badge>
          </CardHeader>
          <CardContent>
            {!metrics ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
                <div className="text-lg font-medium">Ready to run a safe evaluation</div>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  The mock provider exercises prompt rendering, LLM response formatting, assertions,
                  result saving shape and summary metrics without spending API credits.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-4">
                <ResultTile label="Cases" value={String(metrics.totalCases)} />
                <ResultTile label="Success" value={formatPercent(metrics.successRate)} />
                <ResultTile label="Schema" value={formatPercent(metrics.schemaPassRate)} />
                <ResultTile label="Avg cost" value={formatCost(metrics.avgCost)} />
              </div>
            )}
            {snapshot && (
              <div className="mt-5 overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Case</th>
                      <th className="px-4 py-3">Pass</th>
                      <th className="px-4 py-3">Latency</th>
                      <th className="px-4 py-3">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {snapshot.results.map((result) => (
                      <tr key={result.id}>
                        <td className="px-4 py-3">{result.testCaseId}</td>
                        <td className="px-4 py-3">
                          <Badge tone={result.pass ? "success" : "danger"}>
                            {result.pass ? "pass" : "fail"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{result.latencyMs}ms</td>
                        <td className="px-4 py-3">{result.totalTokens}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SetupRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
