import { State } from "@/types";
import {
  ApiResponse,
  ApiResponseSchema,
  ResponseResult,
} from "@/lib/validation/generate/GenerateZodTypes";

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
