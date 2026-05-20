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
        title="Compare Report"
        description="Compare two eval runs and turn changes in quality, latency and cost into a concise review artifact."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Baseline vs current mock run</CardTitle>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4" />
              Export Markdown
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <CompareTile
              label="Success rate"
              current={formatPercent(metrics.successRate)}
              previous={formatPercent(previous.successRate)}
              positive
            />
            <CompareTile
              label="Schema pass rate"
              current={formatPercent(metrics.schemaPassRate)}
              previous={formatPercent(previous.schemaPassRate)}
              positive
            />
            <CompareTile
              label="Average latency"
              current={`${metrics.avgLatencyMs}ms`}
              previous={`${previous.avgLatencyMs}ms`}
              positive={metrics.avgLatencyMs < previous.avgLatencyMs}
            />
            <CompareTile
              label="Average cost"
              current={formatCost(metrics.avgCost)}
              previous={formatCost(previous.avgCost)}
              positive={metrics.avgCost <= previous.avgCost}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report narrative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-50">
              Current prompt version keeps JSON validity and schema adherence stable across
              the starter dataset. Mock latency and cost remain safe for local demos. Next review
              should focus on failure-mode tagging and human score fields before adding LLM-as-judge.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="success">JSON stable</Badge>
              <Badge tone="warning">V0.1 rule-only</Badge>
              <Badge tone="accent">Resume-ready</Badge>
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
          <div className="mt-1 text-xs text-muted-foreground">Previous: {previous}</div>
        </div>
        <div className={positive ? "text-emerald-600" : "text-rose-600"}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
