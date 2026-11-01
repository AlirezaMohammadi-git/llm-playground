import { client } from "../OpenAI/client";
import getInstructionsPrompt from "../prompts/instructions";

export type GenerateInput = {
  model: string;
  baseUrl: string;
  apiKey: string;
  prompt: string;
  temperature?: number | null | undefined;
  maxTokens?: number | null | undefined;
  topP?: number | null | undefined;
  topK?: number | null | undefined;
};

export async function generate(input: GenerateInput) {
  const context = [
    { role: "system" as const, content: "You are a helpful assistant." },
    { role: "user" as const, content: input.prompt },
  ];

  const response = await client.responses.create({
    model: input.model,
    instructions: getInstructionsPrompt(),
    temperature: input.temperature || undefined,
    max_output_tokens: input.maxTokens || undefined,
    top_p: input.topP || undefined,
    input: context,
  });

  return response;
}
