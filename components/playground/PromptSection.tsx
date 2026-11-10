"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { State, Action } from "@/types";
import { createApiRequests } from "@/lib/api/history/apiHistoryStorage";
import { useUIEvents } from "./PlaygroundForm";
import Loader from "../ui/loader";
import { fetchGenerate } from "@/lib/api/Generate";

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
