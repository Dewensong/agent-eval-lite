import type { z } from "zod";
import type {
  evalResultSchema,
  evalRunSchema,
  runTraceSchema,
  summaryMetricsSchema
} from "@/lib/schema/domain";

export type SummaryMetrics = z.infer<typeof summaryMetricsSchema>;
export type EvalRun = z.infer<typeof evalRunSchema>;
export type EvalResult = z.infer<typeof evalResultSchema>;
export type RunTrace = z.infer<typeof runTraceSchema>;
