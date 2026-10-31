"use client";

import { Action, State } from "@/lib/types";
import { useReducer } from "react";
import Controls from "./Controls";
import ResponseSection from "./ResponsesSection";
import PromptSection from "./PromptSection";

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

export default function Playground({ defaultState }: { defaultState: State }) {
  const [firstState, firstDispatch] = useReducer(reducer, defaultState);

  const [secondState, secondDispatch] = useReducer(reducer, defaultState);

  return (
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
  );
}
