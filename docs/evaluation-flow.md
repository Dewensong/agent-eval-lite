# Evaluation Flow

```text
Select Dataset
-> Select Prompt Version
-> Select Model Provider
-> Select Assertions
-> Render prompt variables
-> Call model adapter
-> Save raw output shape
-> Execute assertions
-> Save eval result shape
-> Aggregate summary metrics
-> Review result matrix
-> Inspect run detail / trace
-> Compare report
```

## Prompt Rendering

Prompt variables use `{{variableName}}`. Missing variables stop the model call and produce a failed result with a readable error.

## Assertions

V0.1 supports:

- `is-json`
- `json-schema`
- `contains`
- `not-contains`
- `regex`
- `length-range`
- `exact-match`
- `manual-score`

`manual-score` is a placeholder assertion that passes the automated run while reserving a human review slot.

## Metrics

- `totalCases`
- `passedCases`
- `failedCases`
- `successRate`
- `jsonValidRate`
- `schemaPassRate`
- `avgLatencyMs`
- `avgTokens`
- `avgCost`
