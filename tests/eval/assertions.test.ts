import { describe, expect, it } from "vitest";
import { runAssertions } from "@/lib/eval/assertions";
import type { Assertion } from "@/types/assertion";

const baseAssertion = {
  createdAt: "2026-05-20T00:00:00.000Z",
  updatedAt: "2026-05-20T00:00:00.000Z"
};

describe("assertion engine", () => {
  it("checks json, schema, contains, regex, length and exact match assertions", () => {
    const assertions: Assertion[] = [
      { ...baseAssertion, id: "a1", name: "valid json", type: "is-json", config: {} },
      {
        ...baseAssertion,
        id: "a2",
        name: "schema",
        type: "json-schema",
        config: {
          schema: {
            type: "object",
            required: ["summary", "decision"],
            properties: {
              summary: { type: "string" },
              decision: { type: "string" }
            }
          }
        }
      },
      {
        ...baseAssertion,
        id: "a3",
        name: "contains",
        type: "contains",
        config: { value: "summary", caseSensitive: false }
      },
      {
        ...baseAssertion,
        id: "a4",
        name: "regex",
        type: "regex",
        config: { pattern: "\"decision\"\\s*:", flags: "" }
      },
      {
        ...baseAssertion,
        id: "a5",
        name: "length",
        type: "length-range",
        config: { min: 10, max: 120, unit: "char" }
      }
    ];

    const results = runAssertions({
      assertions,
      actualOutput: '{"summary":"short","decision":"ship"}',
      expectedOutput: { summary: "short", decision: "ship" },
      latencyMs: 100,
      cost: 0.001
    });

    expect(results.every((result) => result.pass)).toBe(true);
  });

  it("marks not-contains failures with readable reasons", () => {
    const results = runAssertions({
      assertions: [
        {
          ...baseAssertion,
          id: "blocked",
          name: "No leak",
          type: "not-contains",
          config: { value: "password", caseSensitive: false }
        }
      ],
      actualOutput: "The password is visible",
      expectedOutput: null,
      latencyMs: 50,
      cost: 0
    });

    expect(results[0]).toMatchObject({
      pass: false,
      score: 0
    });
    expect(results[0].reason).toContain("forbidden");
  });

  it("preserves manual-score as pending without failing the run", () => {
    const results = runAssertions({
      assertions: [
        {
          ...baseAssertion,
          id: "manual",
          name: "Manual review",
          type: "manual-score",
          config: {}
        }
      ],
      actualOutput: "Looks okay",
      expectedOutput: null,
      latencyMs: 20,
      cost: 0
    });

    expect(results[0]).toMatchObject({
      pass: true,
      score: 0
    });
  });
});
