"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { State, Action } from "@/lib/types";
import { CompletionResponse, CompletionResponseSchema } from "@/lib/validation/request";

export type GenerateOutput = {
  result: string;
  error?: string;
};

const fetchGenerate = async (
  state: State,
): Promise<CompletionResponse | { success: false; result: null }> => {
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
    const parsedData = CompletionResponseSchema.safeParse(data); // Validate the response against the schema
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
  firstDispatch: React.Dispatch<Action>,
  secondDispatch: React.Dispatch<Action>,
) => {
  const firstOutput = await fetchGenerate(firstState);
  const secondOutput = await fetchGenerate(secondState);

  if (!firstOutput.success) {
    firstDispatch({ type: "SET_RESPONSE", payload: `Error: ${firstOutput.result}` });
  } else {
    firstDispatch({ type: "SET_RESPONSE", payload: firstOutput.result.choices[0].text });
  }

  if (!secondOutput.success) {
    secondDispatch({ type: "SET_RESPONSE", payload: `Error: ${secondOutput.result}` });
  } else {
    secondDispatch({ type: "SET_RESPONSE", payload: secondOutput.result.choices[0].text });
  }
};

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
        <Button
          variant="default"
          onClick={handleSendRequest.bind(
            null,
            firstState,
            secondState,
            firstDispatch,
            secondDispatch,
          )}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
