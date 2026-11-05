"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { State, Action } from "@/types";
import { ApiResponse, ApiResponseSchema, ResponseResult } from "@/lib/validation/request";
import { createApiRequests } from "@/lib/api/apiHistoryStorage";
import { useUIEvents } from "./PlaygroundForm";
import Loader from "../ui/loader";

const fetchGenerate = async (
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
const handleSendRequest = async (
  firstState: State,
  secondState: State,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  firstDispatch: React.Dispatch<Action>,
  secondDispatch: React.Dispatch<Action>,
) => {
  setLoading(true);
  setError(null);
  const firstOutput = await fetchGenerate(firstState, setError);
  const secondOutput = await fetchGenerate(secondState, setError);

  try {
    if (firstOutput.success) {
      firstDispatch({ type: "SET_RESPONSE", payload: firstOutput.result });
    }

    if (secondOutput.success) {
      secondDispatch({ type: "SET_RESPONSE", payload: secondOutput.result });
    }
  } catch (error) {
    setError(
      "An error occurred while processing the request." +
        (error instanceof Error ? error.message : String(error)),
    );
  } finally {
    if (firstOutput.success && secondOutput.success && firstOutput.result && secondOutput.result) {
      // Save both requests to history if both are successful
      const firstOutputWithPrompt = { ...firstOutput.result, prompt: firstState.prompt };
      const secondOutputWithPrompt = { ...secondOutput.result, prompt: secondState.prompt };
      await createApiRequests([firstOutputWithPrompt, secondOutputWithPrompt]);
    }
    setLoading(false);
  }
};

// ############ Prompt Section Component ##########################################
export default function PromptSection({
  firstState,
  secondState,
  firstDispatch,
  secondDispatch,
}: {
  firstState: State;
  secondState: State;
  firstDispatch: React.Dispatch<Action>;
  secondDispatch: React.Dispatch<Action>;
}) {
  const { loading, setLoading, setError } = useUIEvents();
  return (
    <div className="flex flex-col items-start justify-start mt-8 w-full">
      <h2 className="text-2xl font-extrabold">Prompt</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea
          placeholder="Enter your prompt here..."
          value={firstState?.prompt || ""}
          onChange={(e) => {
            firstDispatch?.({ type: "SET_PROMPT", payload: e.target.value });
            secondDispatch?.({ type: "SET_PROMPT", payload: e.target.value });
          }}
        />

        <div className="flex items-center gap-4">
          <Button
            variant="default"
            disabled={loading || !firstState?.prompt}
            onClick={handleSendRequest.bind(
              null,
              firstState,
              secondState,
              setLoading,
              setError,
              firstDispatch,
              secondDispatch,
            )}
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
          <Loader loading={loading} size="sm" />
        </div>
      </div>
    </div>
  );
}
