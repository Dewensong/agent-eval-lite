import type { z } from "zod";
import type { promptSchema, promptVersionSchema } from "@/lib/schema/domain";

export type Prompt = z.infer<typeof promptSchema>;
export type PromptVersion = z.infer<typeof promptVersionSchema>;
