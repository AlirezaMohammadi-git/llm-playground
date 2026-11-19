import { getClient } from "../OpenAI/client";
import getGenerateInstructions from "../prompts/instructions";
import { GenerateInput } from "../validation/generate/GenerateZodTypes";

export async function generate(input: GenerateInput) {
  const client = await getClient();
  const instructions = await getGenerateInstructions();
  const context = [
    { role: "developer" as const, content: "You are a helpful assistant." },
    { role: "user" as const, content: input.prompt },
  ];

  const response = await client.responses.create({
    model: input.model,
    instructions: instructions,
    temperature: input.temperature || undefined,
    max_output_tokens: input.maxTokens || undefined,
    top_p: input.topP || undefined,
    input: context,
  });

  return response;
}
