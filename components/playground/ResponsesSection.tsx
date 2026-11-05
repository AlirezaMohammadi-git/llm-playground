"use client";

import { Textarea } from "@/components/ui/textarea";
import { State, Action } from "@/types";
import { Badge } from "../ui/badge";

type ResponseSectionProps = {
  state?: State;
  dispatch?: React.Dispatch<Action>;
  numberOfResponses: number;
  hide?: boolean;
};

export default function ResponseSection({ state, numberOfResponses, hide }: ResponseSectionProps) {
  const badgeClassName = "text-xs/2 text-muted-foreground";
  return (
    <div className={` ${hide ? "hidden" : ""} flex flex-col items-start justify-start mt-8 w-full`}>
      <h2 className="text-2xl font-extrabold">Response {numberOfResponses}</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <div className="flex flex-col items-start justify-start gap-2 w-full">
          <Textarea
            readOnly
            className="w-full"
            placeholder="Response will appear here..."
            value={state?.response?.output_text || ""}
          />
          <p className="text-xs text-muted-foreground">
            {state?.response?.output_text
              ? `${state.response.output_text.length} characters`
              : "0 characters"}
            {" - "}
            {state?.response?.latency
              ? `Latency: ${state.response?.latency.toFixed(2)} ms`
              : "Latency: N/A"}
            {" - "}
            {state?.response?.model ? `Model: ${state.response?.model}` : "Model: N/A"}
          </p>
          <div className="grid grid-flow-row-dense grid-cols-2 gap-2">
            <Badge variant={"secondary"} className={badgeClassName}>
              {state?.response?.usage?.input_tokens
                ? `Input Tokens: ${state.response?.usage.input_tokens}`
                : "Input Tokens: N/A"}
            </Badge>
            <Badge variant={"secondary"} className={badgeClassName}>
              {state?.response?.usage?.output_tokens
                ? `Output Tokens: ${state.response?.usage.output_tokens}`
                : "Output Tokens: N/A"}
            </Badge>
            <Badge variant={"secondary"} className={badgeClassName}>
              {state?.response?.usage?.total_tokens
                ? `Total Tokens: ${state.response?.usage.total_tokens}`
                : "Total Tokens: N/A"}
            </Badge>
            <Badge variant="secondary" className={badgeClassName}>
              {state?.response?.estimated_cost?.irt
                ? `Estimated Cost (IRT): ${state.response.estimated_cost.irt.toFixed(4)}`
                : "Estimated Cost (IRT): N/A"}
            </Badge>
            <Badge variant="secondary" className={badgeClassName}>
              {state?.response?.estimated_cost?.unit
                ? `Estimated Cost (USD): $${state.response.estimated_cost.unit}`
                : "Estimated Cost (USD): N/A"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
