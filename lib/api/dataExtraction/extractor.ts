"use server";

import "server-only";

import { getClient } from "@/lib/OpenAI/client";
import { getExtractionInstruction } from "@/lib/prompts/instructions";
import {
  InvoiceSchema,
  ResumeSchema,
  SupportEmailSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";
import type { RequestExtractionInput } from "@/types/dataExtraction";
import { loadDefaultRequest } from "../LoadDefaults";

type ExtractionSchema = {
  name: string;
  schema: Record<string, unknown>;
};
type ResponseInput = {
  role: "user";
  content:
    | string
    | Array<
        | {
            type: "input_text";
            text: string;
          }
        | {
            type: "input_file";
            filename: string;
            file_data: string;
          }
      >;
};

function getExtractionSchema(requestType: RequestExtractionInput["requestType"]): ExtractionSchema {
  switch (requestType) {
    case "EMAIL":
      return {
        name: "SupportEmailExtraction",
        schema: SupportEmailSchema.toJSONSchema(),
      };

    case "INVOICE":
      return {
        name: "InvoiceExtraction",
        schema: InvoiceSchema.toJSONSchema(),
      };

    case "RESUME":
      return {
        name: "ResumeExtraction",
        schema: ResumeSchema.toJSONSchema(),
      };

    default:
      throw new Error(`Unsupported extraction request type: ${requestType}`);
  }
}

async function createExtractionResponse({
  model,
  instructions,
  input,
  extractionSchema,
}: {
  model: string;
  instructions: string;
  input: ResponseInput[];
  extractionSchema: ExtractionSchema;
}) {
  const client = await getClient();

  return client.responses.create({
    model,
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: extractionSchema.name,
        schema: extractionSchema.schema,
        strict: true,
      },
    },
  });
}

async function buildExtractionInput(
  request: RequestExtractionInput,
  prompt: string,
): Promise<ResponseInput[]> {
  if (request.requestType === "EMAIL") {
    if (!request.email?.trim()) {
      throw new Error("Email content is required.");
    }

    return [
      {
        role: "user",
        content: `${prompt}

---
EMAIL CONTENT:
${request.email}
---`,
      },
    ];
  }

  if (!(request.file instanceof File)) {
    throw new Error(`A file is required for ${request.requestType} extraction.`);
  }

  if (request.file.size === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const buffer = Buffer.from(await request.file.arrayBuffer());
  const base64 = buffer.toString("base64");

  return [
    {
      role: "user",
      content: [
        {
          type: "input_file",
          filename: request.file.name,
          file_data: `data:application/pdf;base64,${base64}`,
        },
        {
          type: "input_text",
          text: prompt,
        },
      ],
    },
  ];
}

function getValidationSchema(requestType: RequestExtractionInput["requestType"]) {
  switch (requestType) {
    case "EMAIL":
      return SupportEmailSchema;

    case "INVOICE":
      return InvoiceSchema;

    case "RESUME":
      return ResumeSchema;

    default:
      throw new Error(`Unsupported extraction request type: ${requestType}`);
  }
}

function parseAndValidateExtraction(
  output: string | undefined,
  requestType: RequestExtractionInput["requestType"],
) {
  const stringData = output?.trim();

  if (!stringData) {
    throw new Error("AI returned an empty response.");
  }

  let data: unknown;

  try {
    data = JSON.parse(stringData);
  } catch (error) {
    console.error("Failed to parse AI response:", {
      output: stringData,
      error,
    });

    throw new Error("AI returned invalid JSON.");
  }

  const result = getValidationSchema(requestType).safeParse(data);

  if (!result.success) {
    console.error("AI response validation failed:", {
      requestType,
      issues: result.error.issues,
    });

    throw new Error(`AI returned an invalid ${requestType} extraction result.`);
  }

  return result.data;
}

/**
 * Extract structured data from email/document input
 * using OpenAI Responses API + Structured Outputs + Zod.
 */
export async function requestExtraction(request: RequestExtractionInput) {
  const { instructions, prompt } = await getExtractionInstruction(request.requestType);

  const defaultReq = loadDefaultRequest();
  const extractionSchema = getExtractionSchema(request.requestType);

  const input = await buildExtractionInput(request, prompt);

  const response = await createExtractionResponse({
    model:
      request.requestType === "INVOICE" || request.requestType === "RESUME"
        ? "gpt-5.6-luna"
        : defaultReq.model,
    instructions,
    input,
    extractionSchema,
  });

  return parseAndValidateExtraction(response.output_text, request.requestType);
}
