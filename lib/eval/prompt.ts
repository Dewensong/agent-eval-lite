import type { JsonValue } from "@/types/common";

const variablePattern = /{{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}}/g;

export function extractPromptVariables(template: string): string[] {
  const seen = new Set<string>();
  const variables: string[] = [];

  for (const match of template.matchAll(variablePattern)) {
    const variable = match[1];
    if (!seen.has(variable)) {
      seen.add(variable);
      variables.push(variable);
    }
  }

  return variables;
}

export function renderPromptTemplate(
  template: string,
  inputVars: Record<string, JsonValue>
): { rendered: string; missingVariables: string[] } {
  const missingVariables: string[] = [];
  const rendered = template.replace(variablePattern, (token, variable: string) => {
    const value = inputVars[variable];
    if (value === undefined) {
      missingVariables.push(variable);
      return token;
    }

    if (typeof value === "string") {
      return value;
    }

    return JSON.stringify(value);
  });

  return {
    rendered,
    missingVariables: [...new Set(missingVariables)]
  };
}
