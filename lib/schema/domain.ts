import { z } from "zod";
import { dateStringSchema, jsonValueSchema } from "@/lib/schema/common";

export const modelProviderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.literal("openai-compatible").or(z.literal("mock")),
  baseUrl: z.string().min(1),
  modelName: z.string().min(1),
  apiKeyEnvName: z.string().optional(),
  defaultTemperature: z.number().min(0).max(2).default(0.2),
  defaultMaxTokens: z.number().int().positive().default(1200),
  pricingInputPer1M: z.number().min(0).default(0),
  pricingOutputPer1M: z.number().min(0).default(0),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const promptSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  currentVersionId: z.string().optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const promptVersionSchema = z.object({
  id: z.string(),
  promptId: z.string(),
  version: z.number().int().positive(),
  systemPrompt: z.string(),
  userTemplate: z.string(),
  variables: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const testCaseSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  inputVars: z.record(jsonValueSchema),
  expectedOutput: jsonValueSchema.optional().nullable(),
  tags: z.array(z.string()).default([]),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const datasetSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  testCases: z.array(testCaseSchema).default([]),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const assertionTypeSchema = z.enum([
  "is-json",
  "json-schema",
  "contains",
  "not-contains",
  "regex",
  "length-range",
  "exact-match",
  "manual-score"
]);

export const assertionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: assertionTypeSchema,
  config: z.record(jsonValueSchema).default({}),
  description: z.string().optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const assertionResultSchema = z.object({
  assertionId: z.string(),
  type: assertionTypeSchema,
  pass: z.boolean(),
  score: z.number().min(0).max(1),
  reason: z.string(),
  details: z.unknown().optional()
});

export const summaryMetricsSchema = z.object({
  totalCases: z.number().int().nonnegative(),
  passedCases: z.number().int().nonnegative(),
  failedCases: z.number().int().nonnegative(),
  successRate: z.number().min(0).max(1),
  jsonValidRate: z.number().min(0).max(1),
  schemaPassRate: z.number().min(0).max(1),
  avgLatencyMs: z.number().nonnegative(),
  avgTokens: z.number().nonnegative(),
  avgCost: z.number().nonnegative()
});

export const evalRunSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  promptVersionId: z.string(),
  modelProviderId: z.string(),
  datasetId: z.string(),
  assertionIds: z.array(z.string()),
  status: z.enum(["pending", "running", "completed", "failed"]),
  summaryMetrics: summaryMetricsSchema,
  startedAt: dateStringSchema.optional(),
  finishedAt: dateStringSchema.optional(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});

export const evalResultSchema = z.object({
  id: z.string(),
  evalRunId: z.string(),
  testCaseId: z.string(),
  promptVersionId: z.string(),
  modelProviderId: z.string(),
  input: z.record(jsonValueSchema),
  expected: jsonValueSchema.optional().nullable(),
  actualOutput: z.string(),
  rawOutput: z.string(),
  pass: z.boolean(),
  assertionResults: z.array(assertionResultSchema),
  latencyMs: z.number().nonnegative(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  error: z.string().nullable(),
  createdAt: dateStringSchema
});

export const runTraceSchema = z.object({
  id: z.string(),
  evalRunId: z.string(),
  evalResultId: z.string(),
  testCaseId: z.string(),
  prompt: z.object({
    systemPrompt: z.string(),
    userPrompt: z.string(),
    renderedPrompt: z.string()
  }),
  request: z.unknown(),
  response: z.unknown().optional(),
  error: z.string().nullable(),
  latencyMs: z.number().nonnegative(),
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
  totalTokens: z.number().int().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
  createdAt: dateStringSchema
});

export const reportSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  evalRunIds: z.array(z.string()),
  summary: summaryMetricsSchema,
  markdown: z.string(),
  createdAt: dateStringSchema,
  updatedAt: dateStringSchema
});
