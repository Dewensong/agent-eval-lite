import Ajv, { type ErrorObject } from "ajv";
import { parseJsonOutput } from "@/lib/eval/json";
import type { Assertion, AssertionResult, AssertionType } from "@/types/assertion";
import type { JsonValue } from "@/types/common";

export type AssertionExecutionInput = {
  assertions: Assertion[];
  actualOutput: string;
  expectedOutput: JsonValue | undefined | null;
  latencyMs: number;
  cost?: number;
};

const ajv = new Ajv({ allErrors: true, strict: false });

export function runAssertions(input: AssertionExecutionInput): AssertionResult[] {
  return input.assertions.map((assertion) => runAssertion(assertion, input));
}

function runAssertion(
  assertion: Assertion,
  input: AssertionExecutionInput
): AssertionResult {
  switch (assertion.type) {
    case "is-json":
      return runIsJson(assertion, input.actualOutput);
    case "json-schema":
      return runJsonSchema(assertion, input.actualOutput);
    case "contains":
      return runContains(assertion, input.actualOutput, true);
    case "not-contains":
      return runContains(assertion, input.actualOutput, false);
    case "regex":
      return runRegex(assertion, input.actualOutput);
    case "length-range":
      return runLengthRange(assertion, input.actualOutput);
    case "exact-match":
      return runExactMatch(assertion, input.actualOutput, input.expectedOutput);
    case "manual-score":
      return result(assertion, true, getNumber(assertion.config.score, 0), "Pending manual review");
    default:
      return result(assertion, false, 0, `Unsupported assertion type: ${assertion.type}`);
  }
}

function runIsJson(assertion: Assertion, actualOutput: string): AssertionResult {
  const parsed = parseJsonOutput(actualOutput);
  return parsed.ok
    ? result(assertion, true, 1, "Output is valid JSON", { parsed: parsed.value })
    : result(assertion, false, 0, `Output is not valid JSON: ${parsed.error}`, {
        source: parsed.source
      });
}

function runJsonSchema(assertion: Assertion, actualOutput: string): AssertionResult {
  const parsed = parseJsonOutput(actualOutput);
  if (!parsed.ok) {
    return result(assertion, false, 0, `Cannot validate schema because JSON parsing failed: ${parsed.error}`);
  }

  const schema = assertion.config.schema;
  if (!schema || typeof schema !== "object") {
    return result(assertion, false, 0, "json-schema assertion requires a schema object");
  }

  const validate = ajv.compile(schema);
  const pass = validate(parsed.value);
  return pass
    ? result(assertion, true, 1, "JSON Schema validation passed")
    : result(assertion, false, 0, formatAjvErrors(validate.errors));
}

function runContains(
  assertion: Assertion,
  actualOutput: string,
  shouldContain: boolean
): AssertionResult {
  const value = getString(assertion.config.value, "");
  if (!value) {
    return result(assertion, false, 0, `${assertion.type} assertion requires a value`);
  }

  const caseSensitive = getBoolean(assertion.config.caseSensitive, false);
  const haystack = caseSensitive ? actualOutput : actualOutput.toLowerCase();
  const needle = caseSensitive ? value : value.toLowerCase();
  const contains = haystack.includes(needle);

  if (shouldContain) {
    return contains
      ? result(assertion, true, 1, `Output contains "${value}"`)
      : result(assertion, false, 0, `Output does not contain "${value}"`);
  }

  return !contains
    ? result(assertion, true, 1, `Output does not contain forbidden value "${value}"`)
    : result(assertion, false, 0, `Output contains forbidden value "${value}"`);
}

function runRegex(assertion: Assertion, actualOutput: string): AssertionResult {
  const pattern = getString(assertion.config.pattern, "");
  const flags = getString(assertion.config.flags, "");

  if (!pattern) {
    return result(assertion, false, 0, "regex assertion requires a pattern");
  }

  try {
    const expression = new RegExp(pattern, flags);
    const pass = expression.test(actualOutput);
    return pass
      ? result(assertion, true, 1, `Output matches /${pattern}/${flags}`)
      : result(assertion, false, 0, `Output does not match /${pattern}/${flags}`);
  } catch (error) {
    return result(
      assertion,
      false,
      0,
      error instanceof Error ? `Invalid regex: ${error.message}` : "Invalid regex"
    );
  }
}

function runLengthRange(assertion: Assertion, actualOutput: string): AssertionResult {
  const min = getNumber(assertion.config.min, 0);
  const max = getNumber(assertion.config.max, Number.POSITIVE_INFINITY);
  const unit = getString(assertion.config.unit, "char");
  const length =
    unit === "word" ? actualOutput.trim().split(/\s+/).filter(Boolean).length : actualOutput.length;
  const pass = length >= min && length <= max;

  return pass
    ? result(assertion, true, 1, `Output length ${length} is within ${min}-${max}`)
    : result(assertion, false, 0, `Output length ${length} is outside ${min}-${max}`);
}

function runExactMatch(
  assertion: Assertion,
  actualOutput: string,
  expectedOutput: JsonValue | undefined | null
): AssertionResult {
  const configuredValue = assertion.config.value;
  const expected =
    configuredValue !== undefined
      ? String(configuredValue)
      : typeof expectedOutput === "string"
        ? expectedOutput
        : JSON.stringify(expectedOutput);

  const trim = getBoolean(assertion.config.trim, true);
  const caseSensitive = getBoolean(assertion.config.caseSensitive, true);
  const normalize = (value: string) => {
    const trimmed = trim ? value.trim() : value;
    return caseSensitive ? trimmed : trimmed.toLowerCase();
  };
  const pass = normalize(actualOutput) === normalize(expected ?? "");

  return pass
    ? result(assertion, true, 1, "Output exactly matches expected value")
    : result(assertion, false, 0, "Output does not exactly match expected value", {
        expected,
        actual: actualOutput
      });
}

function result(
  assertion: Assertion,
  pass: boolean,
  score: number,
  reason: string,
  details?: unknown
): AssertionResult {
  return {
    assertionId: assertion.id,
    type: assertion.type as AssertionType,
    pass,
    score,
    reason,
    details
  };
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) {
    return "JSON Schema validation failed";
  }

  return errors
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .join("; ");
}

function getString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
