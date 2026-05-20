import { ShieldCheck } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoAssertions } from "@/lib/db/demo-data";
import { PageHeader } from "@/components/workbench/page-header";

export function AssertionsPage() {
  const availableTypes = [
    "is-json",
    "json-schema",
    "contains",
    "not-contains",
    "regex",
    "length-range",
    "exact-match",
    "manual-score"
  ];

  return (
    <AppShell active="/assertions">
      <MobileNav />
      <PageHeader
        title="断言规则"
        description="借鉴 promptfoo 的规则型检查，让第一版评测保持确定、轻量、容易解释。"
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>创建断言</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableTypes.map((type) => (
              <button
                className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
                key={type}
              >
                <span>{type}</span>
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>当前断言包</CardTitle>
            <Button size="sm" variant="outline">绑定到评测</Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {demoAssertions.map((assertion) => (
                <div className="rounded-lg border bg-white p-4" key={assertion.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{assertion.name}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{assertion.description}</p>
                    </div>
                    <Badge tone={assertion.type === "json-schema" ? "warning" : "accent"}>
                      {assertion.type}
                    </Badge>
                  </div>
                  <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">
                    {JSON.stringify(assertion.config, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
