import { z } from "zod";

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema)
  ])
);

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: apiErrorSchema.nullable(),
    meta: z
      .object({
        requestId: z.string().optional(),
        durationMs: z.number().optional()
      })
      .optional()
  });

export type ApiResponse<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta?: {
    requestId?: string;
    durationMs?: number;
  };
};

export const dateStringSchema = z.string().datetime().or(z.string().min(1));
