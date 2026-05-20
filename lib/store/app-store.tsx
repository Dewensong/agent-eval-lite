"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { Assertion } from "@/types/assertion";
import type { Dataset, TestCase } from "@/types/dataset";
import type { EvalResult, EvalRun, RunTrace } from "@/types/evaluation";
import type { Prompt, PromptVersion } from "@/types/prompt";
import type { ModelProvider } from "@/types/provider";
import { demoAssertions, demoDataset, demoPrompt, demoPromptVersion, demoProvider } from "@/lib/db/demo-data";
import { loadState, saveState } from "@/lib/store/storage";

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

export type AppState = {
  prompts: Prompt[];
  promptVersions: PromptVersion[];
  providers: ModelProvider[];
  datasets: Dataset[];
  assertions: Assertion[];
  evalRuns: EvalRun[];
  evalResults: EvalResult[];
  traces: RunTrace[];
};

function seedState(): AppState {
  return {
    prompts: [demoPrompt],
    promptVersions: [demoPromptVersion],
    providers: [demoProvider],
    datasets: [demoDataset],
    assertions: demoAssertions,
    evalRuns: [],
    evalResults: [],
    traces: []
  };
}

function getInitialState(): AppState {
  const saved = loadState();
  if (saved) return saved;
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}

/* ------------------------------------------------------------------ */
/*  Actions                                                            */
/* ------------------------------------------------------------------ */

type AppAction =
  | { type: "UPSERT_PROMPT"; payload: Prompt }
  | { type: "DELETE_PROMPT"; payload: string }
  | { type: "UPSERT_PROMPT_VERSION"; payload: PromptVersion }
  | { type: "DELETE_PROMPT_VERSION"; payload: string }
  | { type: "UPSERT_PROVIDER"; payload: ModelProvider }
  | { type: "DELETE_PROVIDER"; payload: string }
  | { type: "UPSERT_DATASET"; payload: Dataset }
  | { type: "DELETE_DATASET"; payload: string }
  | { type: "UPSERT_TEST_CASE"; payload: { datasetId: string; testCase: TestCase } }
  | { type: "DELETE_TEST_CASE"; payload: { datasetId: string; testCaseId: string } }
  | { type: "UPSERT_ASSERTION"; payload: Assertion }
  | { type: "DELETE_ASSERTION"; payload: string }
  | { type: "ADD_EVAL_RUN"; payload: { run: EvalRun; results: EvalResult[]; traces: RunTrace[] } }
  | { type: "DELETE_EVAL_RUN"; payload: string };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "UPSERT_PROMPT": {
      const idx = state.prompts.findIndex((p) => p.id === action.payload.id);
      const prompts =
        idx >= 0
          ? [...state.prompts.slice(0, idx), action.payload, ...state.prompts.slice(idx + 1)]
          : [...state.prompts, action.payload];
      return { ...state, prompts };
    }
    case "DELETE_PROMPT":
      return { ...state, prompts: state.prompts.filter((p) => p.id !== action.payload) };

    case "UPSERT_PROMPT_VERSION": {
      const idx = state.promptVersions.findIndex((v) => v.id === action.payload.id);
      const promptVersions =
        idx >= 0
          ? [...state.promptVersions.slice(0, idx), action.payload, ...state.promptVersions.slice(idx + 1)]
          : [...state.promptVersions, action.payload];
      return { ...state, promptVersions };
    }
    case "DELETE_PROMPT_VERSION":
      return {
        ...state,
        promptVersions: state.promptVersions.filter((v) => v.id !== action.payload)
      };

    case "UPSERT_PROVIDER": {
      const idx = state.providers.findIndex((p) => p.id === action.payload.id);
      const providers =
        idx >= 0
          ? [...state.providers.slice(0, idx), action.payload, ...state.providers.slice(idx + 1)]
          : [...state.providers, action.payload];
      return { ...state, providers };
    }
    case "DELETE_PROVIDER":
      return { ...state, providers: state.providers.filter((p) => p.id !== action.payload) };

    case "UPSERT_DATASET": {
      const idx = state.datasets.findIndex((d) => d.id === action.payload.id);
      const datasets =
        idx >= 0
          ? [...state.datasets.slice(0, idx), action.payload, ...state.datasets.slice(idx + 1)]
          : [...state.datasets, action.payload];
      return { ...state, datasets };
    }
    case "DELETE_DATASET":
      return { ...state, datasets: state.datasets.filter((d) => d.id !== action.payload) };

    case "UPSERT_TEST_CASE": {
      const datasets = state.datasets.map((d) => {
        if (d.id !== action.payload.datasetId) return d;
        const idx = d.testCases.findIndex((tc) => tc.id === action.payload.testCase.id);
        const testCases =
          idx >= 0
            ? [...d.testCases.slice(0, idx), action.payload.testCase, ...d.testCases.slice(idx + 1)]
            : [...d.testCases, action.payload.testCase];
        return { ...d, testCases, updatedAt: new Date().toISOString() };
      });
      return { ...state, datasets };
    }
    case "DELETE_TEST_CASE": {
      const datasets = state.datasets.map((d) => {
        if (d.id !== action.payload.datasetId) return d;
        return {
          ...d,
          testCases: d.testCases.filter((tc) => tc.id !== action.payload.testCaseId),
          updatedAt: new Date().toISOString()
        };
      });
      return { ...state, datasets };
    }

    case "UPSERT_ASSERTION": {
      const idx = state.assertions.findIndex((a) => a.id === action.payload.id);
      const assertions =
        idx >= 0
          ? [...state.assertions.slice(0, idx), action.payload, ...state.assertions.slice(idx + 1)]
          : [...state.assertions, action.payload];
      return { ...state, assertions };
    }
    case "DELETE_ASSERTION":
      return { ...state, assertions: state.assertions.filter((a) => a.id !== action.payload) };

    case "ADD_EVAL_RUN":
      return {
        ...state,
        evalRuns: [...state.evalRuns, action.payload.run],
        evalResults: [...state.evalResults, ...action.payload.results],
        traces: [...state.traces, ...action.payload.traces]
      };

    case "DELETE_EVAL_RUN":
      return {
        ...state,
        evalRuns: state.evalRuns.filter((r) => r.id !== action.payload),
        evalResults: state.evalResults.filter((r) => r.evalRunId !== action.payload),
        traces: state.traces.filter((t) => t.evalRunId !== action.payload)
      };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

type AppStore = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <AppStoreContext.Provider value={{ state, dispatch }}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Convenience helpers (outside the component so they're tree-shaken) */
/* ------------------------------------------------------------------ */

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
