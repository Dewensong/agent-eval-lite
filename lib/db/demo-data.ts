import type { Assertion } from "@/types/assertion";
import type { Dataset } from "@/types/dataset";
import type { Prompt, PromptVersion } from "@/types/prompt";
import type { ModelProvider } from "@/types/provider";

const now = "2026-05-20T00:00:00.000Z";

export const demoPrompt: Prompt = {
  id: "prompt_customer_insight",
  name: "Customer Insight JSON Prompt",
  description: "Turns short user feedback into structured product insight.",
  currentVersionId: "prompt_customer_insight_v1",
  createdAt: now,
  updatedAt: now
};

export const demoPromptVersion: PromptVersion = {
  id: "prompt_customer_insight_v1",
  promptId: demoPrompt.id,
  version: 1,
  systemPrompt:
    "You are an evaluation-safe assistant. Return concise JSON only, without markdown fences.",
  userTemplate:
    "Analyze the user input and return JSON with summary, decision, confidence and category.\n\nInput: {{input}}",
  variables: ["input"],
  notes: "Baseline version for AgentEval Lite smoke tests.",
  createdAt: now,
  updatedAt: now
};

export const demoProvider: ModelProvider = {
  id: "provider_mock",
  name: "Mock JSON Provider",
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
  name: "General Prompt Eval Starter",
  description: "A small neutral dataset covering summarization, intent, JSON output, classification and risk review.",
  createdAt: now,
  updatedAt: now,
  testCases: [
    {
      id: "case_summary",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "Summarize: The user says setup was easy, but the pricing page was confusing."
      },
      expectedOutput: {
        summary: "Setup was easy but pricing was confusing",
        decision: "needs_followup",
        confidence: 0.8
      },
      tags: ["summary", "product-feedback"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_intent",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "Intent: I want to export this report as CSV for my manager."
      },
      expectedOutput: {
        summary: "User wants CSV export",
        decision: "feature_request",
        confidence: 0.9
      },
      tags: ["intent", "classification"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_json",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "Return a structured JSON review for a prompt that sometimes forgets required fields."
      },
      expectedOutput: {
        summary: "Prompt may miss required fields",
        decision: "needs_fix",
        confidence: 0.85
      },
      tags: ["json", "schema"],
      createdAt: now,
      updatedAt: now
    },
    {
      id: "case_risk",
      datasetId: "dataset_general_eval",
      inputVars: {
        input: "Risk review: the model reveals private customer notes in a public answer."
      },
      expectedOutput: {
        summary: "Private notes may be exposed",
        decision: "needs_review",
        confidence: 0.95
      },
      tags: ["risk", "safety"],
      createdAt: now,
      updatedAt: now
    }
  ]
};

export const demoAssertions: Assertion[] = [
  {
    id: "assert_is_json",
    name: "Valid JSON",
    type: "is-json",
    config: {},
    description: "The model output must parse as JSON.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_schema",
    name: "Insight JSON Schema",
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
    description: "The output must include required product insight fields.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_contains_summary",
    name: "Contains summary key",
    type: "contains",
    config: { value: "summary", caseSensitive: false },
    description: "The raw output should include the summary field.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "assert_length",
    name: "Concise output",
    type: "length-range",
    config: { min: 20, max: 500, unit: "char" },
    description: "Keep output concise enough for review.",
    createdAt: now,
    updatedAt: now
  }
];

export const demoReports = [
  {
    id: "report_mock_compare",
    title: "Mock Provider Baseline Report",
    headline: "Baseline prompt is stable on JSON validity and schema adherence.",
    delta: "+18% success rate vs. previous draft"
  }
];
