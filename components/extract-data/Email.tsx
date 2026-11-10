"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  SupportEmail,
  SupportEmailSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";
import { Info, Loader2 } from "lucide-react";
import {
  ExtractionApiResponse,
  ExtractionApiResponseSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";
import { RequestExtractionInput } from "@/types/dataExtraction";
import { Item, ItemContent, ItemDescription, ItemTitle } from "../ui/item";

export default function EmailExtraction() {
  const [emailInput, setEmailInput] = useState("");
  const [emailResult, setEmailResult] = useState<SupportEmail | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<[string, string]>(["", ""]); // 1st value is error, 2en is error message
  const topicClassName = "text-lg font-semibold";

  return (
    <div className="w-full flex flex-col gap-2 max-w-2xl place-self-center">
      <h3 className={topicClassName}>Email Input</h3>
      <div className="w-full grid gap-2">
        <Textarea
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="font-sm max-h-[256px] no-scrollbar"
          placeholder="Write your raw email here..."
        />
        <Button
          variant={"default"}
          disabled={isProcessing || !emailInput}
          onClick={async () => {
            await handleEmailProcess(emailInput, setEmailResult, setIsProcessing, setError);
          }}
        >
          {isProcessing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          {isProcessing ? "Thinking" : "Process"}
        </Button>
        <div className="flex flex-row gap-2 items-center">
          <Info className={`text-destructive w-4 h-4 ${error[0] === "" ? "hidden" : ""}`} />
          <p className={`text-sm text-destructive ${error[0] === "" ? "hidden" : ""}`}>
            {error[0]}
          </p>
        </div>
        <div className={`${error[1] === "" ? "hidden" : ""} bg-card p-4 rounded-2xl`}>
          <p className={`text-xs text-card-foreground ${error[1] === "" ? "hidden" : ""}`}>
            {error[1]}
          </p>
        </div>
      </div>
      <div className="my-6" hidden={emailResult === null}>
        <h3 className={topicClassName}>Result</h3>
        <SummaryItem title={"Customer Name"} value={emailResult?.customer_name} />
        <SummaryItem title={"Ticket Type"} value={emailResult?.ticket_type} />
        <SummaryItem title={"Order Number"} value={emailResult?.order_number} />
        <SummaryItem title={"Purchase Timeframe"} value={emailResult?.purchase_timeframe} />
        <SummaryItem title={"Issue"} value={emailResult?.issue} />
        <SummaryItem title={"Requested Resolution"} value={emailResult?.requested_resolution} />
      </div>
    </div>
  );
}

async function handleEmailProcess(
  rawEmail: string,
  setEmail: (supportMail: SupportEmail | null) => void,
  setIsProcessing: (process: boolean) => void,
  setError: (error: [string, string]) => void,
) {
  setIsProcessing(true);
  try {
    const res = await fetchExtraction({
      requestType: "EMAIL",
      email: rawEmail,
    });

    if (!res.success || !res.result) {
      setError(["Failed while requesting to server.", ``]);
      return;
    }

    const validated = SupportEmailSchema.safeParse(res.result);
    if (!res.success && !validated.success) {
      setError(["An error happend during process your request.", `${validated.error}`]);
      return;
    }
    const mail = validated.data || null;
    setEmail(mail);
    return;
  } catch (e) {
    if (e instanceof Error) {
      setError([`An error happend during process your request.`, e.message]);
      return;
    } else {
      setError(["Request to server failed", ``]);
      return;
    }
  } finally {
    setIsProcessing(false);
  }
}

export const fetchExtraction = async (
  rawData: RequestExtractionInput,
): Promise<ExtractionApiResponse> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rawData),
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(`API returned invalid JSON. Status: ${response.status}`);
  }

  console.log("Extraction API response:", data);

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : `API request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  /**
   * Validate our /api/extract response wrapper.
   */
  const apiResponse = ExtractionApiResponseSchema.safeParse(data);

  if (!apiResponse.success) {
    console.error("Invalid extraction API response:", apiResponse.error.issues);

    throw new Error(`Invalid extraction API response: ${apiResponse.error.message}`);
  }

  return apiResponse.data;
};

export function SummaryItem({ title, value }: { title: string; value?: string }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Item variant="outline" className="my-2">
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription dir="rtl" className="line-clamp-none text-wrap break-words">
            {value}
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  );
}
