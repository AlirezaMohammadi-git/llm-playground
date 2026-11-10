import { RequestInput } from "@/types/api";
import { State } from "../../types";
import { DataType } from "@/types/dataExtraction";

export function loadDefaultState(): State {
  const baseUrl = process.env.AVALAI_BASE_URL || "";
  const apiKey = process.env.AVALAI_API_KEY || "";
  const model = process.env.DEFAULT_MODEL || null;

  return {
    model,
    baseUrl,
    apiKey,
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
    prompt: null,
    response: null,
  } as State;
}

export function loadDefaultRequest(
  defaultPrompt: string = "",
  defaultTemp: number = 0.1,
  defaultMaxTokens: number = 1024,
): RequestInput {
  const baseUrl = process.env.AVALAI_BASE_URL;
  const apiKey = process.env.AVALAI_API_KEY;
  const model = process.env.DEFAULT_MODEL;

  if (!baseUrl || !apiKey || !model) {
    throw new Error("Missing required environment variables for API configuration.");
  }

  return {
    model,
    baseUrl,
    apiKey,
    prompt: defaultPrompt,
    temperature: defaultTemp,
    maxTokens: defaultMaxTokens,
  };
}

export function getInstructionVersion(type: DataType): string {
  const emailVersion = process.env.EMAIL_CONFIG_VERSION || "1";
  const resumeVersion = process.env.RESUME_CONFIG_VERSION || "1";
  const invoiceVersion = process.env.INVOICE_CONFIG_VERSION || "1";
  let v: string;
  switch (type) {
    case "EMAIL":
      v = emailVersion;
      break;
    case "RESUME":
      v = resumeVersion;
      break;
    case "INVOICE":
      v = invoiceVersion;
      break;
  }
  return v;
}
