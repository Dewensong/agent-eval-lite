import type { z } from "zod";
import type { modelProviderSchema } from "@/lib/schema/domain";

export type ModelProvider = z.infer<typeof modelProviderSchema>;
