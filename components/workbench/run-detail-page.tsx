import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoEvaluationSnapshot } from "@/lib/db/demo-evaluation";
import { demoProvider } from "@/lib/db/demo-data";
import { PageHeader } from "@/components/workbench/page-header";

export async function RunDetailPage({ runId }: { runId: string }) {
  const snapshot = await getDemoEvaluationSnapshot();
  const result = snapshot.results[0];
  const trace = snapshot.traces[0];

  return (
    <AppShell active="/results">
      <MobileNav />
      <PageHeader
        title="运行详情"
        description={`查看 ${runId} 的输入、渲染 Prompt、模型响应、断言原因和 Trace 载荷。`}
      />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>用例概览</CardTitle>
            <Badge tone={result.pass ? "success" : "danger"}>{result.pass ? "通过" : "失败"}</Badge>
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
              <TraceMetric label="模型" value={demoProvider.modelName} />
              <TraceMetric label="延迟" value={`${trace.latencyMs}ms`} />
              <TraceMetric label="Token" value={String(trace.totalTokens ?? 0)} />
              <TraceMetric label="成本" value={`$${(trace.cost ?? 0).toFixed(4)}`} />
            </div>
            <DetailBlock title="渲染后的 Prompt" value={trace.prompt.renderedPrompt} />
            <DetailBlock title="断言结果" value={JSON.stringify(result.assertionResults, null, 2)} />
            <DetailBlock title="原始请求" value={JSON.stringify(trace.request, null, 2)} />
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
