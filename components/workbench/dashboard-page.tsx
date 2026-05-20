import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowUpRight, Clock3, DollarSign, Gauge, ShieldCheck, Sigma } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoEvaluationSnapshot } from "@/lib/db/demo-evaluation";
import { demoDataset, demoPrompt, demoProvider } from "@/lib/db/demo-data";
import { formatCost, formatNumber, formatPercent } from "@/lib/utils";
import { MetricsChart } from "@/components/workbench/metrics-chart";
import { PageHeader } from "@/components/workbench/page-header";

export async function DashboardPage() {
  const snapshot = await getDemoEvaluationSnapshot();
  const metrics = snapshot.evalRun.summaryMetrics;

  return (
    <AppShell active="/dashboard">
      <MobileNav />
      <PageHeader
        title="像做产品系统一样评测 Prompt，而不是凭感觉改。"
        description="AgentEval Lite 把 Prompt 版本、测试集、断言规则和运行轨迹串成一套可复现、可对比、可展示的评测工作台。"
      />
      <div className="mb-6 grid gap-4 metric-grid">
        <MetricCard icon={Sigma} label="运行次数" value="1" helper="模拟基线已就绪" />
        <MetricCard icon={Gauge} label="通过率" value={formatPercent(metrics.successRate)} helper="基于内置测试集" />
        <MetricCard icon={ShieldCheck} label="Schema 通过率" value={formatPercent(metrics.schemaPassRate)} helper="JSON 契约健康度" />
        <MetricCard icon={Clock3} label="平均延迟" value={`${formatNumber(metrics.avgLatencyMs)}ms`} helper="模拟模型响应" />
        <MetricCard icon={DollarSign} label="平均成本" value={formatCost(metrics.avgCost)} helper="零成本演示模式" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>评测健康快照</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                当前 Prompt / 模型服务 / 测试集组合的核心质量指标。
              </p>
            </div>
            <Badge tone="success">已完成</Badge>
          </CardHeader>
          <CardContent>
            <MetricsChart
              data={[
                { name: "通过", value: Math.round(metrics.successRate * 100), fill: "#14b8a6" },
                { name: "JSON", value: Math.round(metrics.jsonValidRate * 100), fill: "#22c55e" },
                { name: "Schema", value: Math.round(metrics.schemaPassRate * 100), fill: "#f59e0b" },
                { name: "失败", value: metrics.failedCases, fill: "#e11d48" }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近评测运行</CardTitle>
            <p className="text-sm text-muted-foreground">适合展示的运行记录，每一次结果都能追溯。</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{snapshot.evalRun.name}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {demoPrompt.name} · {demoProvider.modelName} · {demoDataset.testCases.length} 条用例
                  </div>
                </div>
                <Badge tone="success">{formatPercent(metrics.successRate)}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  className="inline-flex h-8 items-center gap-2 rounded-md border bg-white px-3 text-xs font-medium hover:bg-slate-100"
                  href="/results"
                >
                  查看矩阵 <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Link
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium hover:bg-slate-100"
                  href="/reports"
                >
                  对比报告
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="rounded-md bg-slate-100 p-2 text-slate-700">
            <Icon className="h-4 w-4" />
          </div>
          <Badge tone="neutral">V0.1</Badge>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{helper}</div>
      </CardContent>
    </Card>
  );
}
