import { ResponseResult } from "@/lib/validation/request";

export type State = {
  model: Model | null;
  baseUrl: string;
  apiKey: string;
  temperature: number | null;
  maxTokens: number | null;
  topP: number | null;
  topK: number | null;
  prompt: string | null;
  response: ResponseResult | null;
  latency?: number | null; // Optional latency field to store the time taken for the API request
  inputTokens?: number | null; // Optional inputTokens field to store the number of input tokens used in the API request
  outputTokens?: number | null; // Optional outputTokens field to store the number of output tokens used in the API request
  totalTokens?: number | null; // Optional totalTokens field to store the total tokens used in the API request
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
  | { type: "SET_RESPONSE"; payload: ResponseResult | null };

export type Model = {
  label: string;
  value: string | null;
};
