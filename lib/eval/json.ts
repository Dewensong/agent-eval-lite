import type { JsonValue } from "@/types/common";

export type JsonParseResult =
  | { ok: true; value: JsonValue; source: string }
  | { ok: false; error: string; source: string };

export function extractJsonCandidate(output: string): string {
  const trimmed = output.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export function parseJsonOutput(output: string): JsonParseResult {
  const source = extractJsonCandidate(output);

  try {
    return {
      ok: true,
      value: JSON.parse(source) as JsonValue,
      source
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
      source
    };
  }
}
