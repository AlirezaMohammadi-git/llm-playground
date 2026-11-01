"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { State, Action } from "@/types";
import { ApiResponseSchema } from "@/lib/validation/request";
import z from "zod";
import { createApiRequests } from "@/lib/api/apiHistoryStorage";
import { useUIEvents } from "./PlaygroundForm";
import Loader from "../ui/loader";

const fetchGenerate = async (state: State): Promise<z.infer<typeof ApiResponseSchema>> => {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      console.error(
        `API request failed with status ${response.status}. Error: ${await response.text()}`,
      );
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const parsedData = ApiResponseSchema.safeParse(data); // Validate the response against the schema
    if (!parsedData.success) {
      console.error("API response validation failed:", parsedData.error);
      throw new Error("API response validation failed");
    }
    return parsedData.data;
  } catch (error) {
    console.error("Error during API request:", error);
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
  const firstOutput = await fetchGenerate(firstState);
  const secondOutput = await fetchGenerate(secondState);

  try {
    if (!firstOutput.success) {
      setError("An error occurred while processing the first request.");
      firstDispatch({
        type: "SET_RESPONSE",
        payload: `Error: ${JSON.stringify(firstOutput.result)}`,
      });
    } else {
      firstDispatch({ type: "SET_RESPONSE", payload: firstOutput.result?.output_text || "" });
    }

    if (!secondOutput.success) {
      setError("An error occurred while processing the second request.");
      secondDispatch({
        type: "SET_RESPONSE",
        payload: `Error: ${JSON.stringify(secondOutput.result)}`,
      });
    } else {
      secondDispatch({ type: "SET_RESPONSE", payload: secondOutput.result?.output_text || "" });
    }
  } catch (error) {
    console.error("Error during API request:", error);
    setError("An error occurred while processing the request.");
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
