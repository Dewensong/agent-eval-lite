"use client";

import { useRef, useState } from "react";
import { Database, FileUp, Plus, Trash2 } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { makeId, useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/workbench/page-header";
import type { TestCase } from "@/types/dataset";
import type { JsonValue } from "@/types/common";

export function DatasetPage() {
  const { state, dispatch } = useAppStore();
  const datasets = state.datasets;
  const [selectedId, setSelectedId] = useState(datasets[0]?.id ?? "");
  const dataset = datasets.find((d) => d.id === selectedId) ?? datasets[0] ?? null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newInput, setNewInput] = useState("");
  const [newExpected, setNewExpected] = useState("");
  const [newTags, setNewTags] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!dataset) {
    return (
      <AppShell active="/datasets">
        <MobileNav />
        <PageHeader title="测试集" description="管理可复用测试用例。" />
        <div className="rounded-lg border border-dashed bg-slate-50 p-10 text-center">
          <p className="text-slate-500">暂无测试集，请先创建。</p>
          <Button
            className="mt-4"
            variant="accent"
            onClick={() => {
              const now = new Date().toISOString();
              const ds = {
                id: makeId("dataset"),
                name: "新测试集",
                description: "",
                testCases: [],
                createdAt: now,
                updatedAt: now
              };
              dispatch({ type: "UPSERT_DATASET", payload: ds });
              setSelectedId(ds.id);
            }}
          >
            <Plus className="h-4 w-4" />
            创建测试集
          </Button>
        </div>
      </AppShell>
    );
  }

  function handleAddTestCase() {
    if (!newInput.trim()) return;
    const now = new Date().toISOString();
    let expectedOutput: JsonValue | undefined = undefined;
    if (newExpected.trim()) {
      try {
        expectedOutput = JSON.parse(newExpected) as JsonValue;
      } catch {
        expectedOutput = newExpected.trim();
      }
    }
    const testCase: TestCase = {
      id: makeId("case"),
      datasetId: dataset.id,
      inputVars: { input: newInput.trim() },
      expectedOutput,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: now,
      updatedAt: now
    };
    dispatch({ type: "UPSERT_TEST_CASE", payload: { datasetId: dataset.id, testCase } });
    setNewInput("");
    setNewExpected("");
    setNewTags("");
    setShowAddForm(false);
  }

  function handleImportJson() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const cases: Array<Record<string, unknown>> = Array.isArray(data) ? data : data.test_cases ?? [];
        const now = new Date().toISOString();
        for (const c of cases) {
          const testCase: TestCase = {
            id: makeId("case"),
            datasetId: dataset.id,
            inputVars: (c.input_vars as Record<string, JsonValue>) ??
              (c.inputVars as Record<string, JsonValue>) ??
              { input: "" },
            expectedOutput: (c.expected_output as JsonValue) ??
              (c.expectedOutput as JsonValue) ??
              undefined,
            tags: Array.isArray(c.tags) ? (c.tags as string[]) : [],
            createdAt: now,
            updatedAt: now
          };
          dispatch({ type: "UPSERT_TEST_CASE", payload: { datasetId: dataset.id, testCase } });
        }
      } catch {
        /* ignore parse errors */
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <AppShell active="/datasets">
      <MobileNav />
      <PageHeader
        title="测试集"
        description="管理可复用测试用例，支持 JSON 导入；输入变量、期望输出和标签。"
      />

      {/* dataset selector */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {datasets.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const now = new Date().toISOString();
            const ds = {
              id: makeId("dataset"),
              name: "新测试集",
              description: "",
              testCases: [],
              createdAt: now,
              updatedAt: now
            };
            dispatch({ type: "UPSERT_DATASET", payload: ds });
            setSelectedId(ds.id);
          }}
        >
          <Plus className="h-4 w-4" />
          新建测试集
        </Button>
        {datasets.length > 1 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              dispatch({ type: "DELETE_DATASET", payload: dataset.id });
              const remaining = datasets.filter((d) => d.id !== dataset.id);
              if (remaining.length > 0) setSelectedId(remaining[0].id);
              else setSelectedId("");
            }}
          >
            <Trash2 className="h-4 w-4" />
            删除此测试集
          </Button>
        )}
      </div>

      {/* dataset name editor */}
      <div className="mb-4">
        <Input
          value={dataset.name}
          onChange={(e) =>
            dispatch({
              type: "UPSERT_DATASET",
              payload: { ...dataset, name: e.target.value, updatedAt: new Date().toISOString() }
            })
          }
          className="max-w-xs text-sm font-medium"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>测试集概况</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-slate-100 p-4">
              <Database className="mb-3 h-5 w-5 text-slate-700" />
              <div className="font-medium">{dataset.name}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {dataset.testCases.length} 条用例
              </p>
            </div>
            <Button className="w-full" variant="outline" onClick={handleImportJson}>
              <FileUp className="h-4 w-4" />
              导入 JSON
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            <Button className="w-full" variant="accent" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4" />
              新增用例
            </Button>
          </CardContent>
        </Card>

        {showAddForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新增测试用例</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="block text-sm font-medium">
                输入文本
                <Textarea className="mt-2" value={newInput} onChange={(e) => setNewInput(e.target.value)} />
              </label>
              <label className="block text-sm font-medium">
                期望输出 (JSON, 可选)
                <Textarea
                  className="mt-2 font-mono text-sm"
                  value={newExpected}
                  onChange={(e) => setNewExpected(e.target.value)}
                  placeholder='{"summary":"...","decision":"...","confidence":0.8}'
                />
              </label>
              <label className="block text-sm font-medium">
                标签 (逗号分隔)
                <Input className="mt-2" value={newTags} onChange={(e) => setNewTags(e.target.value)} placeholder="摘要, 产品反馈" />
              </label>
              <Button className="w-full" variant="accent" onClick={handleAddTestCase}>
                添加用例
              </Button>
            </CardContent>
          </Card>
        )}

        {!showAddForm && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>测试用例</CardTitle>
              <Badge tone="accent">{dataset.testCases.length} 条用例</Badge>
            </CardHeader>
            <CardContent>
              {dataset.testCases.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-slate-500">
                  还没有用例，点击"新增用例"或"导入 JSON"添加。
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                      <tr>
                        <th className="px-4 py-3">输入</th>
                        <th className="px-4 py-3">期望输出</th>
                        <th className="px-4 py-3">标签</th>
                        <th className="px-4 py-3 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-white">
                      {dataset.testCases.map((tc) => (
                        <tr key={tc.id}>
                          <td className="max-w-xs px-4 py-4 text-sm">{String(tc.inputVars.input ?? "")}</td>
                          <td className="px-4 py-4 font-mono text-xs text-slate-600">
                            {typeof tc.expectedOutput === "string"
                              ? tc.expectedOutput
                              : JSON.stringify(tc.expectedOutput)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {tc.tags.map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              className="text-slate-400 hover:text-rose-600"
                              onClick={() =>
                                dispatch({
                                  type: "DELETE_TEST_CASE",
                                  payload: { datasetId: dataset.id, testCaseId: tc.id }
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
