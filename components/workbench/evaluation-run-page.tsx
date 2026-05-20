"use client";

import { useState } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runDatasetEvaluation, type RunDatasetEvaluationOutput } from "@/lib/eval/runner";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";
import { OpenAICompatibleAdapter } from "@/lib/llm/openai-compatible";
import { useAppStore } from "@/lib/store/app-store";
import { formatCost, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";
import type { Assertion } from "@/types/assertion";
import type { Dataset } from "@/types/dataset";
import type { PromptVersion } from "@/types/prompt";
import type { ModelProvider } from "@/types/provider";

export function EvaluationRunPage() {
  const { state, dispatch } = useAppStore();
  const { promptVersions, providers, datasets, assertions, evalRuns, evalResults } = state;

  // find owning prompt name for each version
  const versionOptions = promptVersions.map((v) => {
    const prompt = state.prompts.find((p) => p.id === v.promptId);
    return { ...v, promptName: prompt?.name ?? v.promptId };
  });

  const [selectedVersionId, setSelectedVersionId] = useState(versionOptions[0]?.id ?? "");
  const [selectedProviderId, setSelectedProviderId] = useState(providers[0]?.id ?? "");
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasets[0]?.id ?? "");
  const [selectedAssertionIds, setSelectedAssertionIds] = useState<string[]>(
    assertions.map((a) => a.id)
  );

  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [snapshot, setSnapshot] = useState<RunDatasetEvaluationOutput | null>(null);

  const [viewRunId, setViewRunId] = useState(evalRuns[evalRuns.length - 1]?.id ?? "");

  const selectedVersion = versionOptions.find((v) => v.id === selectedVersionId) ?? null;
  const selectedProvider = providers.find((p) => p.id === selectedProviderId) ?? null;
  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) ?? null;
  const selectedAssertions = assertions.filter((a) => selectedAssertionIds.includes(a.id));

  const canRun = selectedVersion && selectedProvider && selectedDataset && selectedAssertions.length > 0;

  async function startRun() {
    if (!canRun) return;
    setStatus("running");

    const adapter =
      selectedProvider.type === "mock"
        ? new MockProviderAdapter()
        : new OpenAICompatibleAdapter();

    const nextSnapshot = await runDatasetEvaluation({
      name: `${selectedVersion.promptName} · ${selectedProvider.name}`,
      promptVersion: selectedVersion as PromptVersion,
      provider: selectedProvider as ModelProvider,
      dataset: selectedDataset as Dataset,
      assertions: selectedAssertions as Assertion[],
      adapter
    });

    dispatch({
      type: "ADD_EVAL_RUN",
      payload: {
        run: nextSnapshot.evalRun,
        results: nextSnapshot.results,
        traces: nextSnapshot.traces
      }
    });

    setSnapshot(nextSnapshot);
    setViewRunId(nextSnapshot.evalRun.id);
    setStatus("done");
  }

  const metrics = snapshot?.evalRun.summaryMetrics;

  /* find results for the currently viewed run */
  const viewedRun = evalRuns.find((r) => r.id === viewRunId);
  const viewedResults = viewedRun
    ? evalResults.filter((r) => r.evalRunId === viewRunId)
    : [];

  function toggleAssertion(id: string) {
    setSelectedAssertionIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  return (
    <AppShell active="/evaluations">
      <MobileNav />
      <PageHeader
        title="评测运行"
        description="选择 Prompt 版本、模型服务、测试集和断言包，然后发起一次成本安全的批量评测。"
      />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>运行配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigSelect
              label="Prompt 版本"
              value={selectedVersionId}
              onChange={setSelectedVersionId}
              options={versionOptions.map((v) => ({
                value: v.id,
                label: `${v.promptName} · v${v.version}`
              }))}
            />
            <ConfigSelect
              label="模型服务"
              value={selectedProviderId}
              onChange={setSelectedProviderId}
              options={providers.map((p) => ({
                value: p.id,
                label: `${p.name} · ${p.modelName}`
              }))}
            />
            <ConfigSelect
              label="测试集"
              value={selectedDatasetId}
              onChange={setSelectedDatasetId}
              options={datasets.map((d) => ({
                value: d.id,
                label: `${d.name} · ${d.testCases.length} 条用例`
              }))}
            />

            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
                断言规则
              </div>
              <div className="space-y-1 rounded-md border bg-white p-3">
                {assertions.length === 0 ? (
                  <p className="text-xs text-slate-400">还没有断言规则，请先去断言页面创建。</p>
                ) : (
                  assertions.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedAssertionIds.includes(a.id)}
                        onChange={() => toggleAssertion(a.id)}
                      />
                      {a.name} <Badge tone="neutral">{a.type}</Badge>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!canRun || status === "running"}
              onClick={startRun}
              variant="accent"
            >
              {status === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              {status === "running" ? "正在运行评测" : "开始批量评测"}
            </Button>

            {!canRun && (
              <p className="text-xs text-muted-foreground">
                请确保已选择 Prompt 版本、模型服务、测试集和至少一条断言规则。
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>运行结果</CardTitle>
            <Badge
              tone={
                status === "done"
                  ? "success"
                  : status === "running"
                    ? "warning"
                    : "neutral"
              }
            >
              {status === "idle" ? "待运行" : status === "running" ? "运行中" : "已完成"}
            </Badge>
          </CardHeader>
          <CardContent>
            {!metrics && viewedResults.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
                <div className="text-lg font-medium">已准备好运行安全评测</div>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  配置 Prompt、模型、测试集和断言后，点击"开始批量评测"。
                  {selectedProvider?.type === "mock"
                    ? " 模拟模型不会消耗任何 API 额度。"
                    : " 将调用真实模型 API。"}
                </p>
              </div>
            ) : (
              <>
                {metrics && (
                  <div className="mb-4 grid gap-3 md:grid-cols-4">
                    <ResultTile label="用例数" value={String(metrics.totalCases)} />
                    <ResultTile label="通过率" value={formatPercent(metrics.successRate)} />
                    <ResultTile label="Schema" value={formatPercent(metrics.schemaPassRate)} />
                    <ResultTile label="平均成本" value={formatCost(metrics.avgCost)} />
                  </div>
                )}

                {/* history selector */}
                {evalRuns.length > 0 && (
                  <div className="mb-4">
                    <select
                      className="rounded-md border bg-white px-3 py-2 text-sm"
                      value={viewRunId}
                      onChange={(e) => setViewRunId(e.target.value)}
                    >
                      {evalRuns.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} · {new Date(r.createdAt).toLocaleString("zh-CN")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {viewedResults.length > 0 && (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                        <tr>
                          <th className="px-4 py-3">用例</th>
                          <th className="px-4 py-3">结果</th>
                          <th className="px-4 py-3">延迟</th>
                          <th className="px-4 py-3">Token</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {viewedResults.map((result) => (
                          <tr key={result.id}>
                            <td className="px-4 py-3">{result.testCaseId}</td>
                            <td className="px-4 py-3">
                              <Badge tone={result.pass ? "success" : "danger"}>
                                {result.pass ? "通过" : "失败"}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function ConfigSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </div>
      <select
        className="w-full rounded-md border bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.length === 0 && (
          <option value="">暂无可用选项</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
