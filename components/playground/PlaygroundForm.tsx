"use client";

import { Action, State } from "@/types";
import { ActionDispatch, createContext, useContext, useReducer, useState } from "react";
import Controls from "./Controls";
import ResponseSection from "./ResponsesSection";
import PromptSection from "./PromptSection";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "../ui/item";
import { CircleAlert } from "lucide-react";

// ############ Context to manage UI events and state ##########################################
const UIEventsContext = createContext<{
  firstState: State;
  secondState: State;
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  firstDispatch: ActionDispatch<[action: Action]>;
  secondDispatch: ActionDispatch<[action: Action]>;
} | null>(null);
export function UIEventsProvider({
  children,
  defaultState,
}: {
  children: React.ReactNode;
  defaultState: State;
}) {
  const [firstState, firstDispatch] = useReducer(reducer, defaultState);
  const [secondState, secondDispatch] = useReducer(reducer, defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <UIEventsContext.Provider
      value={{
        firstState,
        secondState,
        loading,
        error,
        setLoading,
        setError,
        firstDispatch,
        secondDispatch,
      }}
    >
      {children}
    </UIEventsContext.Provider>
  );
}
export function useUIEvents() {
  const context = useContext(UIEventsContext);
  if (!context) {
    throw new Error("useUIEvents must be used within a UIEventsProvider");
  }
  return context;
}

// ############ Main Playground Component ##########################################

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
  return (
    <UIEventsProvider defaultState={defaultState}>
      <PlaygroundForm />
    </UIEventsProvider>
  );
}

function PlaygroundForm() {
  const { firstState, secondState, error, firstDispatch, secondDispatch } = useUIEvents();
  return (
    <div className="flex flex-col items-start justify-start gap-4 mt-8 w-full">
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
        {error ? (
          <Item variant="outline" size="sm">
            <ItemMedia variant="icon">
              <CircleAlert />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Error</ItemTitle>
              <ItemDescription>An error occurred while processing your request.</ItemDescription>
            </ItemContent>
          </Item>
        ) : (
          <>
            <ResponseSection
              state={firstState}
              numberOfResponses={1}
              hide={error !== null || firstState.response === ""}
            />
            <ResponseSection
              state={secondState}
              numberOfResponses={2}
              hide={error !== null || secondState.response === ""}
            />
          </>
        )}
      </div>
      <div className="mb-64"></div>
    </div>
  );
}
