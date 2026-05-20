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
        title="Evaluate prompts like a product system, not a one-off guess."
        description="AgentEval Lite turns prompt versions, datasets, assertions and traces into a repeatable workbench for AI PMs and builders."
      />
      <div className="mb-6 grid gap-4 metric-grid">
        <MetricCard icon={Sigma} label="Total runs" value="1" helper="Mock baseline ready" />
        <MetricCard icon={Gauge} label="Success rate" value={formatPercent(metrics.successRate)} helper="Across sample dataset" />
        <MetricCard icon={ShieldCheck} label="Schema pass" value={formatPercent(metrics.schemaPassRate)} helper="JSON contract health" />
        <MetricCard icon={Clock3} label="Avg latency" value={`${formatNumber(metrics.avgLatencyMs)}ms`} helper="Mock provider response" />
        <MetricCard icon={DollarSign} label="Avg cost" value={formatCost(metrics.avgCost)} helper="Cost-safe demo mode" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Eval health snapshot</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Core quality metrics from the current prompt/provider/dataset combination.
              </p>
            </div>
            <Badge tone="success">Completed</Badge>
          </CardHeader>
          <CardContent>
            <MetricsChart
              data={[
                { name: "Success", value: Math.round(metrics.successRate * 100), fill: "#14b8a6" },
                { name: "JSON", value: Math.round(metrics.jsonValidRate * 100), fill: "#22c55e" },
                { name: "Schema", value: Math.round(metrics.schemaPassRate * 100), fill: "#f59e0b" },
                { name: "Failed", value: metrics.failedCases, fill: "#e11d48" }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Eval Runs</CardTitle>
            <p className="text-sm text-muted-foreground">A resume-friendly run log with clear traceability.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{snapshot.evalRun.name}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {demoPrompt.name} · {demoProvider.modelName} · {demoDataset.testCases.length} cases
                  </div>
                </div>
                <Badge tone="success">{formatPercent(metrics.successRate)}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  className="inline-flex h-8 items-center gap-2 rounded-md border bg-white px-3 text-xs font-medium hover:bg-slate-100"
                  href="/results"
                >
                  Matrix <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Link
                  className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium hover:bg-slate-100"
                  href="/reports"
                >
                  Compare report
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
