"use client";

import { Textarea } from "@/components/ui/textarea";
import { State, Action } from "@/types";

export default function ResponseSection({
  state,
  numberOfResponses,
  hide,
}: {
  state?: State;
  dispatch?: React.Dispatch<Action>;
  numberOfResponses: number;
  hide?: boolean;
}) {
  return (
    <div className={` ${hide ? "hidden" : ""} flex flex-col items-start justify-start mt-8 w-full`}>
      <h2 className="text-2xl font-extrabold">Response {numberOfResponses}</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea
          readOnly
          placeholder="Response will appear here..."
          value={state?.response || ""}
        />
      </div>
    </div>
  );
}
