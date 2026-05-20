"use client";

import Link from "next/link";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { formatCost } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";

export function ResultMatrixPage() {
  const { state } = useAppStore();
  const { evalRuns, evalResults, assertions } = state;

  if (evalRuns.length === 0) {
    return (
      <AppShell active="/results">
        <MobileNav />
        <PageHeader
          title="结果矩阵"
          description="借鉴 promptfoo 的矩阵视图：行是测试用例，列是断言结果和运行指标。"
        />
        <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
          <div className="text-lg font-medium">还没有评测结果</div>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
            运行一次评测后，结果矩阵会展示每条用例在每个断言上的表现。
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-medium text-white hover:bg-slate-800"
            href="/evaluations"
          >
            去运行评测
          </Link>
        </div>
      </AppShell>
    );
  }

  const latestRun = evalRuns[evalRuns.length - 1];
  const runResults = evalResults.filter((r) => r.evalRunId === latestRun.id);
  const runAssertions = assertions.filter((a) => latestRun.assertionIds.includes(a.id));

  return (
    <AppShell active="/results">
      <MobileNav />
      <PageHeader
        title="结果矩阵"
        description="借鉴 promptfoo 的矩阵视图：行是测试用例，列是断言结果和运行指标。"
      />
      {/* run selector */}
      <div className="mb-4">
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm"
          defaultValue={latestRun.id}
          onChange={(e) => {
            /* The results displayed are tied to component state.
               Re-render happens via URL navigation to /results/[runId].
               For now, the matrix shows the latest run. */
            window.location.href = `/results/${e.target.value}`;
          }}
        >
          {evalRuns.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} · {new Date(r.createdAt).toLocaleString("zh-CN")}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{latestRun.name}</CardTitle>
          <Link
            className="inline-flex h-8 items-center rounded-md border bg-white px-3 text-xs font-medium hover:bg-slate-100"
            href={`/results/${latestRun.id}`}
          >
            查看运行详情
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-4 py-3">测试用例</th>
                  {runAssertions.map((a) => (
                    <th className="px-4 py-3" key={a.id}>
                      {a.name}
                    </th>
                  ))}
                  <th className="px-4 py-3">总结果</th>
                  <th className="px-4 py-3">延迟</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">成本</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {runResults.map((result) => (
                  <tr key={result.id}>
                    <td className="max-w-xs px-4 py-4">
                      <div className="font-medium">{result.testCaseId}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        {String(result.input?.input ?? "")}
                      </div>
                    </td>
                    {runAssertions.map((assertion) => {
                      const ar = result.assertionResults.find(
                        (item) => item.assertionId === assertion.id
                      );
                      return (
                        <td className="px-4 py-4" key={assertion.id}>
                          <Badge tone={ar?.pass ? "success" : "danger"}>
                            {ar?.pass ? "通过" : "失败"}
                          </Badge>
                        </td>
                      );
                    })}
                    <td className="px-4 py-4">
                      <Badge tone={result.pass ? "success" : "danger"}>
                        {result.pass ? "通过" : "失败"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{result.latencyMs}ms</td>
                    <td className="px-4 py-4">{result.totalTokens}</td>
                    <td className="px-4 py-4">{formatCost(result.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
