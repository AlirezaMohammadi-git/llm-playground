"use client";

import Controls from "../components/Controls";
import ThemeToggle from "../components/ThemeToggle";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReducer } from "react";

export type State = {
  model: Model | null;
  baseUrl: string;
  apiKey: string;
  temperature: number | null;
  maxTokens: number | null;
  topP: number | null;
  topK: number | null;
  prompt: string | null;
  response: string | null;
};

export type Action =
  | { type: "SET_MODEL"; payload: Model | null }
  | { type: "SET_BASE_URL"; payload: string }
  | { type: "SET_API_KEY"; payload: string }
  | { type: "SET_TEMPERATURE"; payload: number | null }
  | { type: "SET_MAX_TOKENS"; payload: number | null }
  | { type: "SET_TOP_P"; payload: number | null }
  | { type: "SET_TOP_K"; payload: number | null }
  | { type: "SET_PROMPT"; payload: string | null }
  | { type: "SET_RESPONSE"; payload: string | null };

export type Model = {
  label: string;
  value: string | null;
};

export const models: Model[] = [
  { label: "choose a model", value: null },
  { label: "gpt-6-luna", value: "openai/gpt-6-luna" },
  { label: "claude-opus-5.5", value: "anthropic/claude-opus-5.5" },
  { label: "gpt-4o", value: "openai/gpt-4o" },
  { label: "gpt-4o-mini", value: "openai/gpt-4o-mini" },
  { label: "claude-3.5-sonnet", value: "anthropic/claude-3.5-sonnet" },
  { label: "claude-3-opus", value: "anthropic/claude-3-opus" },
  { label: "claude-3-haiku", value: "anthropic/claude-3-haiku" },
  { label: "gemini-flash-1.5", value: "google/gemini-flash-1.5" },
  { label: "gemini-pro-1.5", value: "google/gemini-pro-1.5" },
  { label: "llama-3.1-70b-instruct", value: "meta-llama/llama-3.1-70b-instruct" },
  { label: "llama-3.1-405b-instruct", value: "meta-llama/llama-3.1-405b-instruct" },
  { label: "mistral-large", value: "mistralai/mistral-large" },
  { label: "deepseek-coder", value: "deepseek/deepseek-coder" },
];

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_MODEL":
      return { ...state, model: action.payload };
    case "SET_BASE_URL":
      return { ...state, baseUrl: action.payload };
    case "SET_API_KEY":
      return { ...state, apiKey: action.payload };
    case "SET_TEMPERATURE":
      return { ...state, temperature: action.payload };
    case "SET_MAX_TOKENS":
      return { ...state, maxTokens: action.payload };
    case "SET_TOP_P":
      return { ...state, topP: action.payload };
    case "SET_TOP_K":
      return { ...state, topK: action.payload };
    case "SET_PROMPT":
      return { ...state, prompt: action.payload };
    case "SET_RESPONSE":
      return { ...state, response: action.payload };
    default:
      return state;
  }
}

export default function Home() {
  const [firstState, firstDispatch] = useReducer(reducer, {
    model: null,
    baseUrl: "",
    apiKey: "",
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
    prompt: "",
    response: "",
  });

  const [secondState, secondDispatch] = useReducer(reducer, {
    model: null,
    baseUrl: "",
    apiKey: "",
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
    prompt: "",
    response: "",
  });

  return (
    <div className="flex min-h-screen w-full flex-col p-6 sm:p-8">
      <header className="flex w-full items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Welcome to the LLM Playground</h1>
        <ThemeToggle />
      </header>
      <div className="flex flex-col items-start justify-start gap-4 mt-8 w-full">
        <h2 className="text-2xl font-extrabold mt-16">Controls</h2>
        <div className="flex flex items-start justify-start gap-4 mt-4 w-full">
          <Controls state={firstState} dispatch={firstDispatch} />
          <Controls state={secondState} dispatch={secondDispatch} />
        </div>

        <PromptSection
          firstState={firstState}
          secondState={secondState}
          firstDispatch={firstDispatch}
          secondDispatch={secondDispatch}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <ResponseSection
            state={firstState}
            numberOfResponses={1}
            hide={firstState.response === ""}
          />
          <ResponseSection
            state={secondState}
            numberOfResponses={2}
            hide={secondState.response === ""}
          />
        </div>
        <div className="mb-64"></div>
      </div>
    </div>
  );
}

function PromptSection({
  firstState,
  secondState,
  firstDispatch,
  secondDispatch,
}: {
  firstState: State;
  secondState: State;
  firstDispatch: React.Dispatch<Action>;
  secondDispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="flex flex-col items-start justify-start mt-8 w-full">
      <h2 className="text-2xl font-extrabold">Prompt</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea
          placeholder="Enter your prompt here..."
          value={firstState?.prompt || ""}
          onChange={(e) => {
            firstDispatch?.({ type: "SET_PROMPT", payload: e.target.value });
            secondDispatch?.({ type: "SET_PROMPT", payload: e.target.value });
          }}
        />
        <Button
          variant="default"
          onClick={() => {
            firstDispatch({ type: "SET_RESPONSE", payload: JSON.stringify(firstState) });
            secondDispatch({ type: "SET_RESPONSE", payload: JSON.stringify(secondState) });
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

function ResponseSection({
  state,
  numberOfResponses,
  hide,
}: {
  state?: State;
  dispatch?: React.Dispatch<Action>;
  numberOfResponses: number;
  hide?: boolean;
}) {
  return (
    <div className={` ${hide ? "hidden" : ""} flex flex-col items-start justify-start mt-8 w-full`}>
      <h2 className="text-2xl font-extrabold">Response {numberOfResponses}</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea
          readOnly
          placeholder="Response will appear here..."
          value={state?.response || ""}
        />
      </div>
    </div>
  );
}
