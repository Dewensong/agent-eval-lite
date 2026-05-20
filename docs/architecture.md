# Architecture

AgentEval Lite is a small Next.js App Router application with shared TypeScript domain types.

## Layers

- `app/`: routes and page entrypoints.
- `components/`: visual workbench components and local shadcn/ui-style primitives.
- `lib/schema/`: Zod schemas and API response contracts.
- `lib/eval/`: prompt rendering, JSON parsing, assertions, aggregation and runner.
- `lib/llm/`: mock provider and OpenAI-compatible adapter.
- `lib/db/`: demo repository data and future Supabase repository boundary.
- `types/`: shared TypeScript types inferred from schemas.
- `supabase/migrations/`: persistent PostgreSQL schema.
- `tests/`: Vitest coverage for engine and adapters.

## V0.1 Boundary

The app is intentionally a Prompt / Agent Eval Workbench. It does not include RAG pipelines, MCP tools, multi-agent orchestration, team auth, a full observability SDK or an LLM-as-judge evaluator.

## Data Strategy

Supabase PostgreSQL is the durable storage target. Demo mode uses local sample data and a mock provider so the app can run without secrets.
