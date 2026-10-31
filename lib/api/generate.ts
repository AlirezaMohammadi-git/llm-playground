// lib/api/generate.ts

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
  const response = await fetch(`${input.baseUrl}/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature,
      topK: input.topK,
      topP: input.topP,
      maxTokens: input.maxTokens,
      prompt: input.prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`External API failed: ${response.status}`);
  }

  return response.json();
}
