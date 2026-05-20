"use client";

import { useMemo, useState } from "react";
import { PlayCircle, Save } from "lucide-react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { demoPrompt, demoPromptVersion } from "@/lib/db/demo-data";
import { renderPromptTemplate } from "@/lib/eval/prompt";
import { MockProviderAdapter } from "@/lib/llm/mock-provider";
import { PageHeader } from "@/components/workbench/page-header";

export function PromptStudioPage() {
  const [name, setName] = useState(demoPrompt.name);
  const [systemPrompt, setSystemPrompt] = useState(demoPromptVersion.systemPrompt);
  const [userTemplate, setUserTemplate] = useState(demoPromptVersion.userTemplate);
  const [trialInput, setTrialInput] = useState(
    "用户反馈：新手引导很顺畅，但发票导出入口很难找到。"
  );
  const [output, setOutput] = useState<string>("");

  const rendered = useMemo(
    () => renderPromptTemplate(userTemplate, { input: trialInput }),
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

  return (
    <AppShell active="/prompts">
      <MobileNav />
      <PageHeader
        title="Prompt 工作台"
        description="编辑 Prompt 版本、检查变量，并在批量评测前用模拟模型做一次安全试跑。"
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Prompt 编辑器</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">版本 1 · 变量格式使用 {"{{input}}"}</p>
            </div>
            <Badge tone="accent">草稿已本地保存</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Prompt 名称
              <Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              系统提示词
              <Textarea
                className="mt-2 min-h-24"
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              用户提示词模板
              <Textarea
                className="mt-2 min-h-48 font-mono"
                value={userTemplate}
                onChange={(event) => setUserTemplate(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="accent">
                <Save className="h-4 w-4" />
                保存版本
              </Button>
              <Button variant="outline" onClick={runTrial}>
                <PlayCircle className="h-4 w-4" />
                模拟试跑
              </Button>
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
                  onChange={(event) => setTrialInput(event.target.value)}
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
