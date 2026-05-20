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
        title="模型设置"
        description="通过 Base URL、模型名称和环境变量名配置 OpenAI-compatible 模型服务；API Key 不写入仓库。"
      />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>模型服务配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              服务名称
              <Input className="mt-2" defaultValue={demoProvider.name} />
            </label>
            <label className="block text-sm font-medium">
              Base URL
              <Input className="mt-2" defaultValue="https://api.openai.com/v1" />
            </label>
            <label className="block text-sm font-medium">
              模型名称
              <Input className="mt-2" defaultValue="gpt-4o-mini" />
            </label>
            <label className="block text-sm font-medium">
              API Key 环境变量名
              <Input className="mt-2" defaultValue="OPENAI_COMPATIBLE_API_KEY" />
            </label>
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
              <Badge tone="accent">Default mode</Badge>
              <p className="mt-3 text-sm leading-6 text-teal-900">
                应用内置模拟模型和示例测试集，截图展示与测试验证都不依赖付费 API 调用。
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
