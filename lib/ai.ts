// lib/ai.ts
import { createChat as createChatHelper } from "@shadcn/helpers/ai-sdk";
import type { UIMessage } from "ai";

export const createChat = createChatHelper;

/**
 * استخراج امن متن از پیام
 */
export function getMessageText(message: UIMessage | undefined | null): string {
  if (!message?.parts?.length) return "";

  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}
