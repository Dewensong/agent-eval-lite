# AgentEval Lite

AgentEval Lite is a lightweight visual workbench for testing, evaluating and comparing prompts and LLM agents.

It focuses on a practical loop for AI product managers and AI app developers:

```text
Prompt Version -> Model Provider -> Dataset -> Assertions -> Eval Run -> Result Matrix -> Run Detail -> Compare Report
```

AgentEval Lite is inspired by promptfoo, Langfuse, Phoenix, Opik, DeepEval, Ragas, Helicone and Agenta. It focuses on providing a lightweight visual workflow for prompt and agent evaluation instead of rebuilding a full LLMOps platform.

中文说明：AgentEval Lite 不是重新造 Dify / Langfuse / promptfoo，而是借鉴成熟项目中已经验证过的 Prompt 评测、Trace、Dataset、Experiment、Assertion 等机制，做一个更轻量、更可视化、更适合 AI 产品经理和独立开发者使用的评测工作台。

## Why

Most LLM apps fail not because they cannot run, but because they cannot be measured, compared, traced and improved.

AgentEval Lite turns prompt changes from "I think this is better" into a repeatable evaluation workflow.

## Features

- Prompt Studio: edit prompt versions and run mock trials.
- Model Providers: OpenAI-compatible provider shape with `base_url`, env-based API key, model name and pricing fields.
- Dataset Management: starter JSON dataset with input variables, expected output and tags.
- Assertions: `is-json`, `json-schema`, `contains`, `not-contains`, `regex`, `length-range`, `exact-match`, `manual-score`.
- Evaluation Runs: batch runner with mock provider support.
- Result Matrix: promptfoo-inspired matrix view.
- Run Detail: input, expected output, actual output, rendered prompt, assertion results and trace payload.
- Compare Report: success rate, schema pass rate, latency and cost comparison.

## Screenshots

Screenshots can be added after running the app locally:

- Dashboard: `/dashboard`
- Prompt Studio: `/prompts`
- Result Matrix: `/results`
- Compare Report: `/reports`

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Supabase / PostgreSQL schema
- Zod
- AJV
- Recharts
- Vitest
- ESLint + Prettier

## Quickstart

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

The app includes a mock provider and sample dataset, so it can be demonstrated without a real API key.

## Environment Variables

Copy `.env.example` to `.env.local` and fill values only when you want persistent Supabase storage or a real model provider.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=https://api.openai.com/v1
OPENAI_COMPATIBLE_MODEL=gpt-4o-mini
```

Do not commit real API keys. Provider records should reference an environment variable name such as `OPENAI_COMPATIBLE_API_KEY`.

## Database

The Supabase migration lives at:

```text
supabase/migrations/202605200001_init_agenteval_lite.sql
```

Core tables:

- `prompts`
- `prompt_versions`
- `model_providers`
- `datasets`
- `test_cases`
- `assertions`
- `eval_runs`
- `eval_results`
- `run_traces`
- `reports`

## Evaluation Flow

1. Create or select a prompt version.
2. Configure an OpenAI-compatible provider or use the mock provider.
3. Select a dataset.
4. Select assertion rules.
5. Run the batch evaluation.
6. Review the result matrix and run detail.
7. Compare runs and export a report.

V0.1 intentionally avoids LLM-as-judge, RAG scoring, multi-agent orchestration, MCP integrations, workflow drag-and-drop and full observability SDKs.

## Sample Dataset

Starter cases live in:

```text
data/sample-dataset.json
```

They cover summarization, intent recognition, JSON structured output, classification and risk review.

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm format
```

Before submitting changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Inspired By

- [promptfoo](https://github.com/promptfoo/promptfoo)
- [Langfuse](https://github.com/langfuse/langfuse)
- [Phoenix](https://github.com/Arize-ai/phoenix)
- [Opik](https://github.com/comet-ml/opik)
- [DeepEval](https://github.com/confident-ai/deepeval)
- [Ragas](https://github.com/explodinggradients/ragas)
- [Helicone](https://github.com/Helicone/helicone)
- [Agenta](https://github.com/Agenta-AI/agenta)

This project borrows concepts and product patterns, not source code or UI assets.

## Roadmap

- V0.1: Visual Prompt / Agent Eval Workbench.
- V0.2: promptfoo YAML import/export and Markdown/CSV/JSON report export.
- V0.3: Human review fields, failure-mode tagging and enhanced traces.
- V0.4: Experiment-style run comparison and trend views.
- V0.5: Optional promptfoo CLI, Langfuse, DeepEval or Ragas integrations.

## Resume Positioning

Suggested wording:

> Built AgentEval Lite, a lightweight visual Prompt / Agent evaluation workbench inspired by promptfoo and Langfuse. Implemented prompt versioning, dataset-based batch evaluation, rule assertions, OpenAI-compatible provider adapter, result matrix, run trace details and comparison reports with Next.js, TypeScript, Zod, Supabase schema and Vitest.

## License

MIT
