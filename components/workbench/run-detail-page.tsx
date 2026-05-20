"use client";

import { useParams } from "next/navigation";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/workbench/page-header";

export function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const runId = params?.runId ?? "";

  const { state } = useAppStore();
  const { evalRuns, evalResults, traces, providers } = state;

  const run = evalRuns.find((r) => r.id === runId);
  const result = evalResults.find((r) => r.evalRunId === runId);
  const trace = traces.find((t) => t.evalRunId === runId);
  const provider = run ? providers.find((p) => p.id === run.modelProviderId) : null;

  if (!run || !result) {
    return (
      <AppShell active="/results">
        <MobileNav />
        <PageHeader title="运行详情" description="查看单次运行的完整信息。" />
        <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center text-slate-500">
          未找到运行记录。
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/results">
      <MobileNav />
      <PageHeader
        title="运行详情"
        description={`查看 ${run.name} 的输入、渲染 Prompt、模型响应、断言原因和 Trace 载荷。`}
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>用例概览</CardTitle>
            <Badge tone={result.pass ? "success" : "danger"}>
              {result.pass ? "通过" : "失败"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailBlock title="输入" value={JSON.stringify(result.input, null, 2)} />
            <DetailBlock title="期望输出" value={JSON.stringify(result.expected, null, 2)} />
            <DetailBlock title="实际输出" value={result.actualOutput} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>运行轨迹</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <TraceMetric label="模型" value={provider?.modelName ?? "—"} />
              <TraceMetric label="延迟" value={`${trace?.latencyMs ?? result.latencyMs}ms`} />
              <TraceMetric label="Token" value={String(trace?.totalTokens ?? result.totalTokens ?? 0)} />
              <TraceMetric label="成本" value={`$${((trace?.cost ?? result.cost ?? 0)).toFixed(4)}`} />
            </div>
            <DetailBlock title="渲染后的 Prompt" value={trace?.prompt?.renderedPrompt ?? result.actualOutput} />
            <DetailBlock title="断言结果" value={JSON.stringify(result.assertionResults, null, 2)} />
            <DetailBlock
              title="原始请求"
              value={trace?.request ? JSON.stringify(trace.request, null, 2) : "无"}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{title}</div>
      <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">
        {value}
      </pre>
    </div>
  );
}

function TraceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
