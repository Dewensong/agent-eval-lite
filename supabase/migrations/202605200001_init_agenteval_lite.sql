create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table model_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'openai-compatible',
  base_url text not null,
  model_name text not null,
  api_key_env_name text,
  pricing_input_per_1m numeric not null default 0,
  pricing_output_per_1m numeric not null default 0,
  default_temperature numeric not null default 0.2,
  default_max_tokens integer not null default 1200,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references prompts(id) on delete cascade,
  version integer not null,
  system_prompt text not null,
  user_template text not null,
  variables jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(prompt_id, version)
);

alter table prompts
  add constraint prompts_current_version_id_fkey
  foreign key (current_version_id) references prompt_versions(id);

create table datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table test_cases (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references datasets(id) on delete cascade,
  input_vars jsonb not null,
  expected_output jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table assertions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  config jsonb not null default '{}'::jsonb,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table eval_runs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prompt_version_id uuid not null references prompt_versions(id),
  model_provider_id uuid not null references model_providers(id),
  dataset_id uuid not null references datasets(id),
  assertion_ids uuid[] not null default '{}',
  status text not null default 'pending',
  summary_metrics jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table eval_results (
  id uuid primary key default gen_random_uuid(),
  eval_run_id uuid not null references eval_runs(id) on delete cascade,
  test_case_id uuid not null references test_cases(id) on delete cascade,
  prompt_version_id uuid not null references prompt_versions(id),
  model_provider_id uuid not null references model_providers(id),
  input jsonb not null,
  expected jsonb,
  actual_output text not null default '',
  raw_output text not null default '',
  pass boolean not null default false,
  assertion_results jsonb not null default '[]'::jsonb,
  latency_ms integer not null default 0,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  cost numeric,
  error text,
  review_status text not null default 'pending',
  human_score numeric,
  human_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table run_traces (
  id uuid primary key default gen_random_uuid(),
  eval_run_id uuid not null references eval_runs(id) on delete cascade,
  eval_result_id uuid not null references eval_results(id) on delete cascade,
  test_case_id uuid not null references test_cases(id) on delete cascade,
  prompt jsonb not null,
  request jsonb not null default '{}'::jsonb,
  response jsonb,
  error text,
  latency_ms integer not null default 0,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  cost numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  eval_run_ids uuid[] not null default '{}',
  summary jsonb not null default '{}'::jsonb,
  markdown text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_test_cases_dataset on test_cases(dataset_id);
create index idx_eval_runs_dataset on eval_runs(dataset_id);
create index idx_eval_results_run on eval_results(eval_run_id);
create index idx_eval_results_case on eval_results(test_case_id);
create index idx_run_traces_result on run_traces(eval_result_id);

create trigger set_model_providers_updated_at before update on model_providers
  for each row execute function set_updated_at();
create trigger set_prompts_updated_at before update on prompts
  for each row execute function set_updated_at();
create trigger set_prompt_versions_updated_at before update on prompt_versions
  for each row execute function set_updated_at();
create trigger set_datasets_updated_at before update on datasets
  for each row execute function set_updated_at();
create trigger set_test_cases_updated_at before update on test_cases
  for each row execute function set_updated_at();
create trigger set_assertions_updated_at before update on assertions
  for each row execute function set_updated_at();
create trigger set_eval_runs_updated_at before update on eval_runs
  for each row execute function set_updated_at();
create trigger set_eval_results_updated_at before update on eval_results
  for each row execute function set_updated_at();
create trigger set_run_traces_updated_at before update on run_traces
  for each row execute function set_updated_at();
create trigger set_reports_updated_at before update on reports
  for each row execute function set_updated_at();
