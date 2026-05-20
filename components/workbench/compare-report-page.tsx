"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { formatCost, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";

export function CompareReportPage() {
  const { state } = useAppStore();
  const { evalRuns } = state;

  const [baseRunId, setBaseRunId] = useState(evalRuns[0]?.id ?? "");
  const [compareRunId, setCompareRunId] = useState(
    evalRuns.length > 1 ? evalRuns[1].id : evalRuns[0]?.id ?? ""
  );

  const baseRun = evalRuns.find((r) => r.id === baseRunId);
  const compareRun = evalRuns.find((r) => r.id === compareRunId);

  if (evalRuns.length === 0) {
    return (
      <AppShell active="/reports">
        <MobileNav />
        <PageHeader
          title="对比报告"
          description="对比两次评测运行，把质量、延迟和成本变化整理成一份简洁的复盘材料。"
        />
        <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
          <div className="text-lg font-medium">还没有评测记录</div>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            至少需要两次评测运行才能生成对比报告。
          </p>
        </div>
      </AppShell>
    );
  }

  const baseMetrics = baseRun?.summaryMetrics;
  const compareMetrics = compareRun?.summaryMetrics;

  return (
    <AppShell active="/reports">
      <MobileNav />
      <PageHeader
        title="对比报告"
        description="对比两次评测运行，把质量、延迟和成本变化整理成一份简洁的复盘材料。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">基线运行：</span>
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={baseRunId}
            onChange={(e) => setBaseRunId(e.target.value)}
          >
            {evalRuns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">对比运行：</span>
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={compareRunId}
            onChange={(e) => setCompareRunId(e.target.value)}
          >
            {evalRuns.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {baseMetrics && compareMetrics ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {baseRun?.name} vs {compareRun?.name}
              </CardTitle>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4" />
                导出 Markdown
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <CompareTile
                label="通过率"
                current={formatPercent(compareMetrics.successRate)}
                previous={formatPercent(baseMetrics.successRate)}
                positive={compareMetrics.successRate >= baseMetrics.successRate}
              />
              <CompareTile
                label="Schema 通过率"
                current={formatPercent(compareMetrics.schemaPassRate)}
                previous={formatPercent(baseMetrics.schemaPassRate)}
                positive={compareMetrics.schemaPassRate >= baseMetrics.schemaPassRate}
              />
              <CompareTile
                label="平均延迟"
                current={`${compareMetrics.avgLatencyMs}ms`}
                previous={`${baseMetrics.avgLatencyMs}ms`}
                positive={compareMetrics.avgLatencyMs <= baseMetrics.avgLatencyMs}
              />
              <CompareTile
                label="平均成本"
                current={formatCost(compareMetrics.avgCost)}
                previous={formatCost(baseMetrics.avgCost)}
                positive={compareMetrics.avgCost <= baseMetrics.avgCost}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>报告解读</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-50">
                {compareRun?.name} 相较于 {baseRun?.name}：
                通过率 {compareMetrics.successRate >= baseMetrics.successRate ? "提升" : "下降"}{" "}
                {formatPercent(Math.abs(compareMetrics.successRate - baseMetrics.successRate))}，
                Schema 通过率{" "}
                {compareMetrics.schemaPassRate >= baseMetrics.schemaPassRate ? "提升" : "下降"}{" "}
                {formatPercent(Math.abs(compareMetrics.schemaPassRate - baseMetrics.schemaPassRate))}。
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone={compareMetrics.successRate >= baseMetrics.successRate ? "success" : "warning"}>
                  通过率{compareMetrics.successRate >= baseMetrics.successRate ? "提升" : "下降"}
                </Badge>
                <Badge tone="accent">V0.1 规则型评测</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center text-slate-500">
          请选择两次有效的评测运行。
        </div>
      )}
    </AppShell>
  );
}

function CompareTile({
  label,
  current,
  previous,
  positive
}: {
  label: string;
  current: string;
  previous: string;
  positive: boolean;
}) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold">{current}</div>
          <div className="mt-1 text-xs text-muted-foreground">基线：{previous}</div>
        </div>
        <div className={positive ? "text-emerald-600" : "text-rose-600"}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
