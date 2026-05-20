import type { z } from "zod";
import type { reportSchema } from "@/lib/schema/domain";

export type Report = z.infer<typeof reportSchema>;
