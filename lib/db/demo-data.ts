import type { Assertion } from "@/types/assertion";
import type { Dataset } from "@/types/dataset";
import type { Prompt, PromptVersion } from "@/types/prompt";
import type { ModelProvider } from "@/types/provider";

const now = "2026-05-20T00:00:00.000Z";

export const demoPrompt: Prompt = {
  id: "prompt_customer_insight",
  name: "用户反馈洞察 JSON Prompt",
  description: "把简短用户反馈转成结构化产品洞察。",
  currentVersionId: "prompt_customer_insight_v1",
  createdAt: now,
  updatedAt: now
};

export const demoPromptVersion: PromptVersion = {
  id: "prompt_customer_insight_v1",
  promptId: demoPrompt.id,
  version: 1,
  systemPrompt:
    "你是一个用于评测的安全助手。只返回简洁 JSON，不要输出 Markdown 代码块。",
  userTemplate:
    "分析用户输入，并返回包含 summary、decision、confidence、category 的 JSON。\n\n输入：{{input}}",
  variables: ["input"],
  notes: "AgentEval Lite 冒烟测试的基线版本。",
  createdAt: now,
  updatedAt: now
};

export const demoProvider: ModelProvider = {
  id: "provider_mock",
  name: "模拟 JSON 模型",
  type: "mock",
  baseUrl: "mock://local",
  modelName: "mock-json-001",
  defaultTemperature: 0,
  defaultMaxTokens: 600,
  pricingInputPer1M: 0,
  pricingOutputPer1M: 0,
  createdAt: now,
  updatedAt: now
};

export const demoDataset: Dataset = {
  id: "dataset_general_eval",
  name: "通用 Prompt 评测入门测试集",
  description: "一个中性小测试集，覆盖摘要、意图识别、JSON 结构化输出、分类和风险判断。",
  createdAt: now,
  updatedAt: now,
  testCases: [
    {
      id: "case_summary",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "摘要任务：用户说产品初始化很简单，但价格页面让人困惑。"
      },
      expectedOutput: {
        summary: "初始化简单，但价格页面令人困惑",
        decision: "需要跟进",
        confidence: 0.8
      },
      tags: ["摘要", "产品反馈"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_intent",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "意图识别：我想把这份报告导出成 CSV 发给主管。"
      },
      expectedOutput: {
        summary: "用户想导出 CSV 报告",
        decision: "功能需求",
        confidence: 0.9
      },
      tags: ["意图", "分类"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_json",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "JSON 结构化输出：请评估一个有时会漏掉必填字段的 Prompt。"
      },
      expectedOutput: {
        summary: "Prompt 可能漏掉必填字段",
        decision: "需要修复",
        confidence: 0.85
      },
      tags: ["JSON", "Schema"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_risk",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "风险判断：模型在公开回答里暴露了客户私密备注。"
      },
      expectedOutput: {
        summary: "客户私密备注可能被泄露",
        decision: "需要人工复核",
        confidence: 0.95
      },
      tags: ["风险", "安全"],
      createdAt: now,
      updatedAt: now
    }
  ]
};

export const demoAssertions: Assertion[] = [
  {
    id: "assert_is_json",
    name: "合法 JSON",
    type: "is-json",
    config: {},
    description: "模型输出必须能被解析为 JSON。",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_schema",
    name: "洞察 JSON Schema",
    type: "json-schema",
    config: {
      schema: {
        type: "object",
        required: ["summary", "decision", "confidence"],
        properties: {
          summary: { type: "string" },
          decision: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          category: { type: "string" }
        }
      }
    },
    description: "输出必须包含产品洞察所需字段。",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_contains_summary",
    name: "包含 summary 字段",
    type: "contains",
    config: { value: "summary", caseSensitive: false },
    description: "原始输出需要包含 summary 字段。",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_length",
    name: "输出长度适中",
    type: "length-range",
    config: { min: 20, max: 500, unit: "char" },
    description: "输出应足够简洁，方便人工审阅。",
    createdAt: now,
    updatedAt: now
  }
];

export const demoReports = [
  {
    id: "report_mock_compare",
    title: "模拟模型基线报告",
    headline: "基线 Prompt 在 JSON 合法率和 Schema 通过率上表现稳定。",
    delta: "较上一版草稿通过率提升 18%"
  }
];
