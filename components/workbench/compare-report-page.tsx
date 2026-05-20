import { ArrowDownRight, ArrowUpRight, FileText } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoEvaluationSnapshot } from "@/lib/db/demo-evaluation";
import { formatCost, formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";

export async function CompareReportPage() {
  const snapshot = await getDemoEvaluationSnapshot();
  const metrics = snapshot.evalRun.summaryMetrics;
  const previous = {
    successRate: 0.75,
    schemaPassRate: 0.75,
    avgLatencyMs: metrics.avgLatencyMs + 120,
    avgCost: metrics.avgCost + 0.002
  };

  return (
    <AppShell active="/reports">
      <MobileNav />
      <PageHeader
        title="对比报告"
        description="对比两次评测运行，把质量、延迟和成本变化整理成一份简洁的复盘材料。"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>基线版本 vs 当前模拟运行</CardTitle>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4" />
              导出 Markdown
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <CompareTile
              label="通过率"
              current={formatPercent(metrics.successRate)}
              previous={formatPercent(previous.successRate)}
              positive
            />
            <CompareTile
              label="Schema 通过率"
              current={formatPercent(metrics.schemaPassRate)}
              previous={formatPercent(previous.schemaPassRate)}
              positive
            />
            <CompareTile
              label="平均延迟"
              current={`${metrics.avgLatencyMs}ms`}
              previous={`${previous.avgLatencyMs}ms`}
              positive={metrics.avgLatencyMs < previous.avgLatencyMs}
            />
            <CompareTile
              label="平均成本"
              current={formatCost(metrics.avgCost)}
              previous={formatCost(previous.avgCost)}
              positive={metrics.avgCost <= previous.avgCost}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>报告解读</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-50">
              当前 Prompt 版本在内置测试集上保持了稳定的 JSON 合法率和 Schema 通过率。
              模拟模型的延迟和成本都适合本地演示。下一轮可以先补失败模式标签和人工评分字段，
              再考虑引入 LLM-as-judge。
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">JSON 稳定</Badge>
              <Badge tone="warning">V0.1 规则型评测</Badge>
              <Badge tone="accent">适合简历展示</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
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
          <div className="mt-1 text-xs text-muted-foreground">上一版：{previous}</div>
        </div>
        <div className={positive ? "text-emerald-600" : "text-rose-600"}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
