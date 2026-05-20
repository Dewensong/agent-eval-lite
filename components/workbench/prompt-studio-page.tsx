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
    "The user says onboarding is smooth, but invoice export is hard to find."
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
        title="Prompt Studio"
        description="Create prompt versions, inspect variables and run a safe mock trial before launching a batch evaluation."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Prompt editor</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Version 1 · variables use {"{{input}}"}</p>
            </div>
            <Badge tone="accent">Draft saved locally</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Prompt name
              <Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              System prompt
              <Textarea
                className="mt-2 min-h-24"
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              User template
              <Textarea
                className="mt-2 min-h-48 font-mono"
                value={userTemplate}
                onChange={(event) => setUserTemplate(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="accent">
                <Save className="h-4 w-4" />
                Save version
              </Button>
              <Button variant="outline" onClick={runTrial}>
                <PlayCircle className="h-4 w-4" />
                Run mock trial
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Single case trial</CardTitle>
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
                <div className="mb-2 text-sm font-medium">Rendered prompt</div>
                <pre className="max-h-44 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">
                  {rendered.rendered}
                </pre>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Model output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="min-h-40 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-slate-700">
                {output || "Run the mock trial to preview a JSON response."}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
