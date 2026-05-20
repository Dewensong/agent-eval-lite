import type { z } from "zod";
import type { datasetSchema, testCaseSchema } from "@/lib/schema/domain";

export type Dataset = z.infer<typeof datasetSchema>;
export type TestCase = z.infer<typeof testCaseSchema>;
