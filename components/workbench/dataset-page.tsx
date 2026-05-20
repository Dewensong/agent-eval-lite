import { Database, FileUp } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDataset } from "@/lib/db/demo-data";
import { PageHeader } from "@/components/workbench/page-header";

export function DatasetPage() {
  return (
    <AppShell active="/datasets">
      <MobileNav />
      <PageHeader
        title="Dataset"
        description="Manage reusable test cases with input variables, expected outputs and tags. JSON/CSV import starts with a basic local flow."
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dataset profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-slate-100 p-4">
              <Database className="mb-3 h-5 w-5 text-slate-700" />
              <div className="font-medium">{demoDataset.name}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{demoDataset.description}</p>
            </div>
            <Button className="w-full" variant="outline">
              <FileUp className="h-4 w-4" />
              Import JSON / CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test cases</CardTitle>
            <Badge tone="accent">{demoDataset.testCases.length} cases</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Input</th>
                    <th className="px-4 py-3">Expected</th>
                    <th className="px-4 py-3">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {demoDataset.testCases.map((testCase) => (
                    <tr key={testCase.id}>
                      <td className="max-w-xl px-4 py-4">{String(testCase.inputVars.input)}</td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        {JSON.stringify(testCase.expectedOutput)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {testCase.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
