import Link from "next/link";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoEvaluationSnapshot } from "@/lib/db/demo-evaluation";
import { demoAssertions, demoDataset } from "@/lib/db/demo-data";
import { formatCost } from "@/lib/utils";
import { PageHeader } from "@/components/workbench/page-header";

export async function ResultMatrixPage() {
  const snapshot = await getDemoEvaluationSnapshot();

  return (
    <AppShell active="/results">
      <MobileNav />
      <PageHeader
        title="结果矩阵"
        description="借鉴 promptfoo 的矩阵视图：行是测试用例，列是断言结果和运行指标。"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{snapshot.evalRun.name}</CardTitle>
          <Link
            className="inline-flex h-8 items-center rounded-md border bg-white px-3 text-xs font-medium hover:bg-slate-100"
            href="/results/demo-run"
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
                  {demoAssertions.map((assertion) => (
                    <th className="px-4 py-3" key={assertion.id}>
                      {assertion.type}
                    </th>
                  ))}
                  <th className="px-4 py-3">总结果</th>
                  <th className="px-4 py-3">延迟</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">成本</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {snapshot.results.map((result) => {
                  const testCase = demoDataset.testCases.find((item) => item.id === result.testCaseId);
                  return (
                    <tr key={result.id}>
                      <td className="max-w-xs px-4 py-4">
                        <div className="font-medium">{testCase?.id ?? result.testCaseId}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {String(testCase?.inputVars.input ?? "")}
                        </div>
                      </td>
                      {demoAssertions.map((assertion) => {
                        const assertionResult = result.assertionResults.find(
                          (item) => item.assertionId === assertion.id
                        );
                        return (
                          <td className="px-4 py-4" key={assertion.id}>
                            <Badge tone={assertionResult?.pass ? "success" : "danger"}>
                              {assertionResult?.pass ? "通过" : "失败"}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
