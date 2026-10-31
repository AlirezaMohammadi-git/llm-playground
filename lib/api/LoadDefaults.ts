import { State } from "../types";

export function loadDefaultState(): State {
  const baseUrl = process.env.BASE_URL || "";
  const apiKey = process.env.API_KEY || "";
  const model = process.env.DEFAULT_MODEL || null;

  return {
    model,
    baseUrl,
    apiKey,
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
    prompt: "",
    response: "",
  } as State;
}
