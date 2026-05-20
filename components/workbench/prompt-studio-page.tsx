"use client";

import { useMemo, useState } from "react";
import { PlayCircle, Plus, Save } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { renderPromptTemplate } from "@/lib/eval/prompt";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";
import { makeId, useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/workbench/page-header";
import type { Prompt, PromptVersion } from "@/types/prompt";

export function PromptStudioPage() {
  const { state, dispatch } = useAppStore();
  const { prompts, promptVersions } = state;

  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id ?? "");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId) ?? null;
  const versions = promptVersions
    .filter((v) => v.promptId === selectedPromptId)
    .sort((a, b) => b.version - a.version);

  const activeVersion = selectedVersionId
    ? versions.find((v) => v.id === selectedVersionId) ?? versions[0] ?? null
    : versions[0] ?? null;

  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userTemplate, setUserTemplate] = useState("");
  const [trialInput, setTrialInput] = useState("用户反馈：新手引导很顺畅，但发票导出入口很难找到。");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);

  /* sync editor when selection changes */
  const syncEditor = (prompt: Prompt | null, version: PromptVersion | null) => {
    if (editing) return; // don't clobber unsaved edits
    if (prompt && version) {
      setName(prompt.name);
      setSystemPrompt(version.systemPrompt);
      setUserTemplate(version.userTemplate);
    }
  };

  /* load initial */
  if (!editing && activeVersion && name === "" && systemPrompt === "" && userTemplate === "") {
    syncEditor(selectedPrompt, activeVersion);
  }

  const rendered = useMemo(
    () => renderPromptTemplate(userTemplate || "{{input}}", { input: trialInput }),
    [trialInput, userTemplate]
  );

  async function runTrial() {
    const provider = new MockProviderAdapter();
    const response = await provider.call({
      providerId: "provider_mock",
      modelName: "mock-json-001",
      baseUrl: "mock://local",
      apiKey: "",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rendered.rendered }
      ],
      temperature: 0,
      maxTokens: 600
    });
    setOutput(response.content);
  }

  function handleSaveVersion() {
    if (!selectedPrompt) return;

    const now = new Date().toISOString();
    const maxVersion = Math.max(0, ...versions.map((v) => v.version));
    const newVersion: PromptVersion = {
      id: makeId("pv"),
      promptId: selectedPrompt.id,
      version: maxVersion + 1,
      systemPrompt,
      userTemplate,
      variables: [],
      notes: "",
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: "UPSERT_PROMPT_VERSION", payload: newVersion });

    const updatedPrompt = { ...selectedPrompt, currentVersionId: newVersion.id, updatedAt: now };
    dispatch({ type: "UPSERT_PROMPT", payload: updatedPrompt });

    setSelectedVersionId(newVersion.id);
    setEditing(false);
  }

  function handleCreatePrompt() {
    const now = new Date().toISOString();
    const promptId = makeId("prompt");
    const versionId = makeId("pv");

    const prompt: Prompt = {
      id: promptId,
      name: "新 Prompt",
      description: "",
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now
    };

    const version: PromptVersion = {
      id: versionId,
      promptId,
      version: 1,
      systemPrompt: "你是一个有用的助手。",
      userTemplate: "{{input}}",
      variables: ["input"],
      notes: "",
      createdAt: now,
      updatedAt: now
    };

    dispatch({ type: "UPSERT_PROMPT", payload: prompt });
    dispatch({ type: "UPSERT_PROMPT_VERSION", payload: version });
    setSelectedPromptId(promptId);
    setSelectedVersionId(versionId);
    setName(prompt.name);
    setSystemPrompt(version.systemPrompt);
    setUserTemplate(version.userTemplate);
    setEditing(true);
  }

  return (
    <AppShell active="/prompts">
      <MobileNav />
      <PageHeader
        title="Prompt 工作台"
        description="编辑 Prompt 版本、检查变量，并在批量评测前用模拟模型做一次安全试跑。"
      />

      {/* prompt + version selector */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm"
          value={selectedPromptId}
          onChange={(e) => {
            setSelectedPromptId(e.target.value);
            setSelectedVersionId("");
            setEditing(false);
            const p = prompts.find((pr) => pr.id === e.target.value);
            const v = promptVersions
              .filter((pv) => pv.promptId === e.target.value)
              .sort((a, b) => b.version - a.version)[0];
            if (p && v) {
              setName(p.name);
              setSystemPrompt(v.systemPrompt);
              setUserTemplate(v.userTemplate);
            }
          }}
        >
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {versions.length > 0 && (
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={selectedVersionId || versions[0]?.id || ""}
            onChange={(e) => {
              setSelectedVersionId(e.target.value);
              setEditing(false);
              const v = promptVersions.find((pv) => pv.id === e.target.value);
              if (v) {
                setSystemPrompt(v.systemPrompt);
                setUserTemplate(v.userTemplate);
              }
            }}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.version} {v.id === selectedPrompt?.currentVersionId ? "(当前)" : ""}
              </option>
            ))}
          </select>
        )}

        <Button size="sm" variant="outline" onClick={handleCreatePrompt}>
          <Plus className="h-4 w-4" />
          新建 Prompt
        </Button>

        {activeVersion && (
          <Badge tone="accent">v{activeVersion.version}</Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Prompt 编辑器</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeVersion ? `版本 ${activeVersion.version} · 变量格式使用 {{input}}` : "请先选择或新建 Prompt"}
              </p>
            </div>
            <Badge tone={editing ? "warning" : "accent"}>
              {editing ? "编辑中" : "已加载"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Prompt 名称
              <Input
                className="mt-2"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setEditing(true);
                  if (selectedPrompt) {
                    dispatch({
                      type: "UPSERT_PROMPT",
                      payload: { ...selectedPrompt, name: e.target.value, updatedAt: new Date().toISOString() }
                    });
                  }
                }}
              />
            </label>
            <label className="block text-sm font-medium">
              系统提示词
              <Textarea
                className="mt-2 min-h-24"
                value={systemPrompt}
                onChange={(e) => {
                  setSystemPrompt(e.target.value);
                  setEditing(true);
                }}
              />
            </label>
            <label className="block text-sm font-medium">
              用户提示词模板
              <Textarea
                className="mt-2 min-h-48 font-mono"
                value={userTemplate}
                onChange={(e) => {
                  setUserTemplate(e.target.value);
                  setEditing(true);
                }}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="accent" onClick={handleSaveVersion} disabled={!selectedPrompt}>
                <Save className="h-4 w-4" />
                保存为新版本
              </Button>
              <Button variant="outline" onClick={runTrial}>
                <PlayCircle className="h-4 w-4" />
                模拟试跑
              </Button>
              {selectedPrompt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dispatch({ type: "DELETE_PROMPT", payload: selectedPrompt.id });
                    versions.forEach((v) =>
                      dispatch({ type: "DELETE_PROMPT_VERSION", payload: v.id })
                    );
                    const remaining = prompts.filter((p) => p.id !== selectedPrompt.id);
                    if (remaining.length > 0) {
                      setSelectedPromptId(remaining[0].id);
                      setSelectedVersionId("");
                      setEditing(false);
                    } else {
                      setSelectedPromptId("");
                      setSelectedVersionId("");
                      setName("");
                      setSystemPrompt("");
                      setUserTemplate("");
                    }
                  }}
                >
                  删除此 Prompt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>单条用例试跑</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="block text-sm font-medium">
                input
                <Textarea
                  className="mt-2"
                  value={trialInput}
                  onChange={(e) => setTrialInput(e.target.value)}
                />
              </label>
              <div>
                <div className="mb-2 text-sm font-medium">渲染后的 Prompt</div>
                <pre className="max-h-44 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">
                  {rendered.rendered}
                </pre>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>模型输出</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="min-h-40 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-slate-700">
                {output || "点击模拟试跑，预览 JSON 响应。"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
