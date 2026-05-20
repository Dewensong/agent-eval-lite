import { KeyRound, ServerCog } from "lucide-react";
import type { ComponentType } from "react";
import { AppShell, MobileNav } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoProvider } from "@/lib/db/demo-data";
import { PageHeader } from "@/components/workbench/page-header";

export function SettingsPage() {
  return (
    <AppShell active="/settings">
      <MobileNav />
      <PageHeader
        title="Settings / Model Providers"
        description="Configure OpenAI-compatible providers by base URL, model name and environment variable reference. API keys stay outside the repository."
      />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Provider config</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Provider name
              <Input className="mt-2" defaultValue={demoProvider.name} />
            </label>
            <label className="block text-sm font-medium">
              Base URL
              <Input className="mt-2" defaultValue="https://api.openai.com/v1" />
            </label>
            <label className="block text-sm font-medium">
              Model name
              <Input className="mt-2" defaultValue="gpt-4o-mini" />
            </label>
            <label className="block text-sm font-medium">
              API key env name
              <Input className="mt-2" defaultValue="OPENAI_COMPATIBLE_API_KEY" />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime safety</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <SafetyCard
              icon={KeyRound}
              title="No hardcoded keys"
              description="Provider rows reference env names; secrets are read from local environment variables."
            />
            <SafetyCard
              icon={ServerCog}
              title="OpenAI-compatible"
              description="Kimi, Qwen, DeepSeek, GLM, OpenAI and local gateways can share the same adapter shape."
            />
            <div className="rounded-lg border bg-teal-50 p-4 md:col-span-2">
              <Badge tone="accent">Default mode</Badge>
              <p className="mt-3 text-sm leading-6 text-teal-900">
                The app ships with mock provider + sample dataset, so screenshots and tests do not depend on paid API calls.
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
