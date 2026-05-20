"use client";

import { useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { makeId, useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/workbench/page-header";
import type { Assertion, AssertionType } from "@/types/assertion";
import type { JsonValue } from "@/types/common";

const ASSERTION_TYPES: { type: AssertionType; label: string; defaultConfig: Record<string, unknown> }[] = [
  { type: "is-json", label: "is-json", defaultConfig: {} },
  { type: "json-schema", label: "json-schema", defaultConfig: { schema: { type: "object" } } },
  { type: "contains", label: "contains", defaultConfig: { value: "", caseSensitive: false } },
  { type: "not-contains", label: "not-contains", defaultConfig: { value: "", caseSensitive: false } },
  { type: "regex", label: "regex", defaultConfig: { pattern: "", flags: "" } },
  { type: "length-range", label: "length-range", defaultConfig: { min: 0, max: 500, unit: "char" } },
  { type: "exact-match", label: "exact-match", defaultConfig: { trim: true, caseSensitive: true } },
  { type: "manual-score", label: "manual-score", defaultConfig: {} }
];

export function AssertionsPage() {
  const { state, dispatch } = useAppStore();
  const assertions = state.assertions;

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<AssertionType>("is-json");
  const [formName, setFormName] = useState("");
  const [formConfig, setFormConfig] = useState("{}");

  function handleCreate() {
    if (!formName.trim()) return;
    let config: Record<string, JsonValue> = {};
    try {
      config = JSON.parse(formConfig) as Record<string, JsonValue>;
    } catch {
      /* keep empty */
    }
    const now = new Date().toISOString();
    const assertion: Assertion = {
      id: makeId("assert"),
      name: formName.trim(),
      type: formType,
      config,
      description: "",
      createdAt: now,
      updatedAt: now
    };
    dispatch({ type: "UPSERT_ASSERTION", payload: assertion });
    setFormName("");
    setFormConfig("{}");
    setShowForm(false);
  }

  function openForm(type: AssertionType) {
    const tpl = ASSERTION_TYPES.find((t) => t.type === type);
    setFormType(type);
    setFormName("");
    setFormConfig(JSON.stringify(tpl?.defaultConfig ?? {}, null, 2));
    setShowForm(true);
  }

  return (
    <AppShell active="/assertions">
      <MobileNav />
      <PageHeader
        title="断言规则"
        description="借鉴 promptfoo 的规则型检查，让评测保持确定、轻量、容易解释。"
      />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>创建断言</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ASSERTION_TYPES.map((t) => (
              <button
                className="flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
                key={t.type}
                onClick={() => openForm(t.type)}
              >
                <span>{t.label}</span>
                <ShieldCheck className="h-4 w-4 text-teal-600" />
              </button>
            ))}
          </CardContent>
        </Card>

        {showForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新建断言 · {formType}</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                取消
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block text-sm font-medium">
                断言名称
                <Input
                  className="mt-2"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：合法 JSON"
                />
              </label>
              <label className="block text-sm font-medium">
                配置 (JSON)
                <Textarea
                  className="mt-2 min-h-32 font-mono text-sm"
                  value={formConfig}
                  onChange={(e) => setFormConfig(e.target.value)}
                />
              </label>
              <Button className="w-full" variant="accent" onClick={handleCreate}>
                创建断言
              </Button>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <Card>
            <CardHeader>
              <CardTitle>当前断言包</CardTitle>
            </CardHeader>
            <CardContent>
              {assertions.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-slate-500">
                  还没有断言规则，点击左侧类型创建。
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {assertions.map((assertion) => (
                    <div className="rounded-lg border bg-white p-4" key={assertion.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{assertion.name}</div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {assertion.description || assertion.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge tone={assertion.type === "json-schema" ? "warning" : "accent"}>
                            {assertion.type}
                          </Badge>
                          <button
                            className="ml-1 text-slate-400 hover:text-rose-600"
                            onClick={() =>
                              dispatch({ type: "DELETE_ASSERTION", payload: assertion.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="mt-4 max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">
                        {JSON.stringify(assertion.config, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
