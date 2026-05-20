# Data Model

Core objects:

- `Prompt`
- `PromptVersion`
- `ModelProvider`
- `Dataset`
- `TestCase`
- `Assertion`
- `EvalRun`
- `EvalResult`
- `RunTrace`
- `Report`

Zod schemas live in `lib/schema/domain.ts`; TypeScript types live in `types/`.

## Persistence Tables

The Supabase migration creates:

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

Every table has `id`, `created_at` and `updated_at`.

## API Key Rule

Provider rows should store `api_key_env_name`, not raw API keys. Secrets stay in local environment variables.
