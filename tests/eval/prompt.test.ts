import { describe, expect, it } from "vitest";
import { extractPromptVariables, renderPromptTemplate } from "@/lib/eval/prompt";

describe("prompt templating", () => {
  it("extracts unique variables from a prompt template", () => {
    expect(
      extractPromptVariables("Summarize {{ input }} for {{audience}}. {{input}}")
    ).toEqual(["input", "audience"]);
  });

  it("renders variables and reports missing values", () => {
    const rendered = renderPromptTemplate("Hello {{name}}, {{task}}", {
      name: "Dewens"
    });

    expect(rendered.rendered).toBe("Hello Dewens, {{task}}");
    expect(rendered.missingVariables).toEqual(["task"]);
  });
});
