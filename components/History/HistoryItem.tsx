"use client";

import { ResponseResultSchema } from "@/lib/validation/request";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

interface HistoryItemProps {
  request: z.infer<typeof ResponseResultSchema> | null;
}

export default function HistoryItem({ request }: HistoryItemProps) {
  if (!request) {
    return null;
  }

  const formattedDate = new Date(request.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="border-b py-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2 font-semibold text-sm">
        <span>Model:</span>
        <Badge>{request.model}</Badge>
        <span>Temperature:</span>
        <Badge variant={request.temperature ? "default" : "secondary"}>
          {request.temperature ?? "Not specified"}
        </Badge>
        <span>Max Tokens:</span>
        <Badge variant={request.max_output_tokens ? "default" : "secondary"}>
          {request.max_output_tokens ?? "Not specified"}
        </Badge>
        <span>Top P:</span>
        <Badge variant={request.top_p ? "default" : "secondary"}>
          {request.top_p ?? "Not specified"}
        </Badge>
        <span>Input Tokens:</span>
        <Badge variant={request.usage?.input_tokens ? "default" : "secondary"}>
          {request.usage?.input_tokens ?? "Not specified"}
        </Badge>
        <span>Output Tokens:</span>
        <Badge variant={request.usage?.output_tokens ? "default" : "secondary"}>
          {request.usage?.output_tokens ?? "Not specified"}
        </Badge>
        <span>Total Tokens:</span>
        <Badge variant={request.usage?.total_tokens ? "default" : "secondary"}>
          {request.usage?.total_tokens ?? "Not specified"}
        </Badge>
      </div>

      <p className="mt-2 text-sm">
        <strong>Prompt:</strong> {request.prompt || "No prompt recorded"}
      </p>

      <p className="mt-2 text-sm">
        <strong>Response:</strong> {request.output_text || "No response recorded"}
      </p>

      <p className="text-sm text-muted-foreground">{formattedDate}</p>
    </div>
  );
}
