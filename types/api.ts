export type RequestInput = {
  model: string;
  baseUrl: string;
  apiKey: string;
  prompt: string;
  temperature?: number | null | undefined;
  maxTokens?: number | null | undefined;
  topP?: number | null | undefined;
  topK?: number | null | undefined;
};
