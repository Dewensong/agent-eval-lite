import { describe, expect, it } from "vitest";
import { parseJsonOutput } from "@/lib/eval/json";

describe("json parsing helpers", () => {
  it("parses plain json", () => {
    expect(parseJsonOutput('{"summary":"ok"}')).toMatchObject({
      ok: true,
      value: { summary: "ok" }
    });
  });

  it("extracts json from markdown fences before parsing", () => {
    const parsed = parseJsonOutput('```json\n{"decision":"ship"}\n```');

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value).toEqual({ decision: "ship" });
    }
  });

  it("returns a structured parse error", () => {
    const parsed = parseJsonOutput("{not json}");

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error).toContain("Expected");
    }
  });
});
