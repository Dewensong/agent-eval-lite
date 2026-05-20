"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowUpRight, Clock3, DollarSign, Gauge, ShieldCheck, Sigma } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { formatCost, formatNumber, formatPercent } from "@/lib/utils";
import { MetricsChart } from "@/components/workbench/metrics-chart";
import { PageHeader } from "@/components/workbench/page-header";

export function DashboardPage() {
  const { state } = useAppStore();
  const { evalRuns, prompts, promptVersions, providers, datasets } = state;

  const latestRun = evalRuns[evalRuns.length - 1] ?? null;
  const metrics = latestRun?.summaryMetrics ?? null;

  if (!metrics) {
    return (
      <AppShell active="/dashboard">
        <MobileNav />
        <PageHeader
          title="像做产品系统一样评测 Prompt，而不是凭感觉改。"
          description="AgentEval Lite 把 Prompt 版本、测试集、断言规则和运行轨迹串成一套可复现、可对比、可展示的评测工作台。"
        />
        <div className="rounded-lg border border-dashed bg-slate-50 p-12 text-center">
          <div className="text-lg font-medium">还没有评测记录</div>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            去评测运行页面，选择 Prompt 版本、模型服务、测试集和断言规则，发起第一次评测。
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-medium text-white hover:bg-slate-800"
            href="/evaluations"
          >
            开始评测 <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </AppShell>
    );
  }

  const runPromptVersion = promptVersions.find((v) => v.id === latestRun.promptVersionId);
  const runPrompt = prompts.find((p) => p.id === runPromptVersion?.promptId);
  const runProvider = providers.find((p) => p.id === latestRun.modelProviderId);
  const runDataset = datasets.find((d) => d.id === latestRun.datasetId);

  return (
    <AppShell active="/dashboard">
      <MobileNav />
      <PageHeader
        title="像做产品系统一样评测 Prompt，而不是凭感觉改。"
        description="AgentEval Lite 把 Prompt 版本、测试集、断言规则和运行轨迹串成一套可复现、可对比、可展示的评测工作台。"
      />
      <div className="mb-6 grid gap-4 metric-grid">
        <MetricCard icon={Sigma} label="运行次数" value={String(evalRuns.length)} helper="累计评测运行" />
        <MetricCard icon={Gauge} label="通过率" value={formatPercent(metrics.successRate)} helper="最近一次运行" />
        <MetricCard icon={ShieldCheck} label="Schema 通过率" value={formatPercent(metrics.schemaPassRate)} helper="JSON 契约健康度" />
        <MetricCard icon={Clock3} label="平均延迟" value={`${formatNumber(metrics.avgLatencyMs)}ms`} helper="最近一次运行" />
        <MetricCard icon={DollarSign} label="平均成本" value={formatCost(metrics.avgCost)} helper="最近一次运行" />
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
                  <div className="font-medium">{latestRun.name}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {runPrompt?.name ?? "—"} · {runProvider?.modelName ?? "—"} ·{" "}
                    {runDataset?.testCases.length ?? 0} 条用例
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
