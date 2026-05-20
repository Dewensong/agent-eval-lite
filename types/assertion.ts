import type { z } from "zod";
import type {
  assertionResultSchema,
  assertionSchema,
  assertionTypeSchema
} from "@/lib/schema/domain";

export type AssertionType = z.infer<typeof assertionTypeSchema>;
export type Assertion = z.infer<typeof assertionSchema>;
export type AssertionResult = z.infer<typeof assertionResultSchema>;
