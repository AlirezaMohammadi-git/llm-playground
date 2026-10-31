import { Model } from "./types";

export { cn } from "cn";

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
  { label: "deepseek-chat", value: "deepseek-chat" },
  { label: "gemma-4-26b-a4b-it", value: "gemma-4-26b-a4b-it" },
];
