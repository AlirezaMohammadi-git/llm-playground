import { State } from "@/types";
import { RequestInput } from "@/types/api";
import { getClient } from "../OpenAI/client";
import getGenerateInstructions from "../prompts/instructions";
import { ApiResponse, ApiResponseSchema, ResponseResult } from "../validation/requestValidator";

export async function generate(input: RequestInput) {
  const client = await getClient();
  const instructions = await getGenerateInstructions();
  const context = [
    { role: "system" as const, content: "You are a helpful assistant." },
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
