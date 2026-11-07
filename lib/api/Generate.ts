import { State } from "@/types";
import { getClient } from "../OpenAI/client";
import getInstructionsPrompt from "../prompts/instructions";
import { ApiResponse, ApiResponseSchema, ResponseResult } from "../validation/requestValidator";

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
  const client = await getClient();
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

export const fetchGenerate = async (
  state: State,
  setError: (error: string | null) => void,
): Promise<ApiResponse> => {
  const startTime = performance.now();
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      setError(`API request failed with status ${response.status}`);
      return { success: false, result: null };
    }

    const data = await response.json();
    const parsedData = ApiResponseSchema.safeParse(data); // Validate the response against the schema
    if (!parsedData.success) {
      setError("API response validation failed");
      return { success: false, result: null };
    }
    const totalDuration = performance.now() - startTime;
    const finalResult: ResponseResult = {
      ...(parsedData.data.result as ResponseResult),
      latency: totalDuration,
    };
    return {
      success: true,
      result: finalResult as ApiResponse["result"],
    };
  } catch (error) {
    setError(
      "An error occurred while processing the request." +
        (error instanceof Error ? error.message : String(error)),
    );
    return { success: false, result: null };
  }
};
