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
      name: "手动模拟评测运行",
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
        title="评测运行"
        description="选择 Prompt 版本、模型服务、测试集和断言包，然后发起一次成本安全的批量评测。"
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>运行配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SetupRow label="Prompt 版本" value={`${demoPromptVersion.id} · v${demoPromptVersion.version}`} />
            <SetupRow label="模型服务" value={`${demoProvider.name} · ${demoProvider.modelName}`} />
            <SetupRow label="测试集" value={`${demoDataset.name} · ${demoDataset.testCases.length} 条用例`} />
            <SetupRow label="断言规则" value={`${demoAssertions.length} 条规则检查`} />
            <Button className="w-full" disabled={status === "running"} onClick={startRun} variant="accent">
              {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {status === "running" ? "正在运行模拟评测" : "开始批量评测"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>运行结果</CardTitle>
            <Badge tone={status === "done" ? "success" : status === "running" ? "warning" : "neutral"}>
              {statusLabel(status)}
            </Badge>
          </CardHeader>
          <CardContent>
            {!metrics ? (
              <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
                <div className="text-lg font-medium">已准备好运行安全评测</div>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                  模拟模型会跑通 Prompt 渲染、LLM 响应格式化、断言执行、结果结构和汇总指标，
                  不会消耗任何真实 API 额度。
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-4">
                <ResultTile label="用例数" value={String(metrics.totalCases)} />
                <ResultTile label="通过率" value={formatPercent(metrics.successRate)} />
                <ResultTile label="Schema" value={formatPercent(metrics.schemaPassRate)} />
                <ResultTile label="平均成本" value={formatCost(metrics.avgCost)} />
              </div>
            )}
            {snapshot && (
              <div className="mt-5 overflow-hidden rounded-lg border">
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
                    {snapshot.results.map((result) => (
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

function statusLabel(status: "idle" | "running" | "done") {
  const labels = {
    idle: "待运行",
    running: "运行中",
    done: "已完成"
  };

  return labels[status];
}
