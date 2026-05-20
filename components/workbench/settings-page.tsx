"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { KeyRound, Plus, ServerCog, Trash2 } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { makeId, useAppStore } from "@/lib/store/app-store";
import { PageHeader } from "@/components/workbench/page-header";
import type { ModelProvider } from "@/types/provider";

export function SettingsPage() {
  const { state, dispatch } = useAppStore();
  const providers = state.providers;

  const [selectedId, setSelectedId] = useState(providers[0]?.id ?? "");
  const selected = providers.find((p) => p.id === selectedId) ?? providers[0] ?? null;

  const [name, setName] = useState(selected?.name ?? "");
  const [baseUrl, setBaseUrl] = useState(selected?.baseUrl ?? "");
  const [modelName, setModelName] = useState(selected?.modelName ?? "");
  const [apiKeyEnvName, setApiKeyEnvName] = useState(selected?.apiKeyEnvName ?? "");
  const [saved, setSaved] = useState(false);

  function syncFrom(provider: ModelProvider) {
    setName(provider.name);
    setBaseUrl(provider.baseUrl);
    setModelName(provider.modelName);
    setApiKeyEnvName(provider.apiKeyEnvName ?? "");
    setSaved(false);
  }

  function handleSave() {
    if (!selected || !name.trim()) return;
    const now = new Date().toISOString();
    const updated: ModelProvider = {
      ...selected,
      name: name.trim(),
      baseUrl: baseUrl.trim() || "mock://local",
      modelName: modelName.trim() || "mock-model",
      apiKeyEnvName: apiKeyEnvName.trim() || undefined,
      updatedAt: now
    };
    dispatch({ type: "UPSERT_PROVIDER", payload: updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCreate() {
    const now = new Date().toISOString();
    const id = makeId("provider");
    const provider: ModelProvider = {
      id,
      name: "新模型服务",
      type: "openai-compatible",
      baseUrl: "https://api.openai.com/v1",
      modelName: "gpt-4o-mini",
      apiKeyEnvName: "OPENAI_COMPATIBLE_API_KEY",
      defaultTemperature: 0.2,
      defaultMaxTokens: 1200,
      pricingInputPer1M: 0,
      pricingOutputPer1M: 0,
      createdAt: now,
      updatedAt: now
    };
    dispatch({ type: "UPSERT_PROVIDER", payload: provider });
    setSelectedId(id);
    syncFrom(provider);
  }

  return (
    <AppShell active="/settings">
      <MobileNav />
      <PageHeader
        title="模型设置"
        description="配置 OpenAI-compatible 模型服务；API Key 不写入仓库，只保存环境变量名。"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm"
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            const p = providers.find((pr) => pr.id === e.target.value);
            if (p) syncFrom(p);
          }}
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.type})
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          新增服务
        </Button>
        {providers.length > 1 && selected && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              dispatch({ type: "DELETE_PROVIDER", payload: selected.id });
              const remaining = providers.filter((p) => p.id !== selected.id);
              if (remaining.length > 0) {
                setSelectedId(remaining[0].id);
                syncFrom(remaining[0]);
              } else {
                setSelectedId("");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            删除此服务
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>模型服务配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              服务名称
              <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Base URL
              <Input className="mt-2" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              模型名称
              <Input className="mt-2" value={modelName} onChange={(e) => setModelName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              API Key 环境变量名
              <Input
                className="mt-2"
                value={apiKeyEnvName}
                onChange={(e) => setApiKeyEnvName(e.target.value)}
                placeholder="例如：OPENAI_COMPATIBLE_API_KEY"
              />
            </label>
            <Button className="w-full" variant="accent" onClick={handleSave} disabled={!selected}>
              {saved ? "已保存" : "保存配置"}
            </Button>
            {selected && (
              <div className="text-xs text-muted-foreground">
                类型：{selected.type === "mock" ? "模拟模型（零成本演示）" : "OpenAI-compatible"}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>运行安全</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <SafetyCard
              icon={KeyRound}
              title="不硬编码密钥"
              description="模型服务只保存环境变量名，真实密钥从本地环境变量读取。"
            />
            <SafetyCard
              icon={ServerCog}
              title="OpenAI-compatible"
              description="Kimi、Qwen、DeepSeek、GLM、OpenAI 和本地网关都可以复用同一套适配形态。"
            />
            <div className="rounded-lg border bg-teal-50 p-4 md:col-span-2">
              <Badge tone="accent">模拟模型可用</Badge>
              <p className="mt-3 text-sm leading-6 text-teal-900">
                {selected?.type === "mock"
                  ? "当前使用模拟模型，评测不消耗任何 API 额度。"
                  : "配置 API Key 环境变量后可调用真实模型。"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SafetyCard({
  icon: Icon,
  title,
  description
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <Icon className="h-5 w-5 text-teal-600" />
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
