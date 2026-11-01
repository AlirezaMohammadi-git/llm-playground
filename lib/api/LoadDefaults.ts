import { State } from "../../types";

export function loadDefaultState(): State {
  const baseUrl = process.env.AVALAI_BASE_URL || "";
  const apiKey = process.env.AVALAI_API_KEY || "";
  const model = process.env.DEFAULT_MODEL || null;

  return {
    model,
    baseUrl,
    apiKey,
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
    prompt: null,
    response: "",
  } as State;
}
