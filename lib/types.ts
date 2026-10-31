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
