"use server";

import "server-only";

import { getClient } from "@/lib/OpenAI/client";
import { getConversationInstructions } from "@/lib/prompts/instructions";
import type { ExtractionSchema, RetryOptions } from "@/types/dataExtraction";
import { loadDefaultRequest } from "@/lib/api/LoadDefaults";
import type { ResponseInputItem } from "openai/resources/responses/responses";
import { ZodError } from "zod";
import { delay } from "@/lib/my_utils";
import {
  RequestGenerationInput,
  RequestGenerationOutputSchema,
} from "@/lib/validation/conversation/ConversationZodTypes";
import { InputContentType } from "@/types";

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  return `data:${file.type};base64,${base64}`;
}
async function createExtractionResponse({
  model,
  instructions,
  input,
  extractionSchema,
}: {
  model: string;
  instructions: string;
  input: ResponseInputItem[];
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
  request: RequestGenerationInput,
  prompt: string,
): Promise<ResponseInputItem[]> {
  const validFiles = request.files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  // No file uploaded mode
  if (validFiles.length === 0) {
    if (!request.userPrompt?.trim()) {
      throw new Error("Prompt section can't be empty when no file uploaded.");
    }

    return [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `${prompt}

---

USER_PROMPT:

${request.userPrompt}

---`,
          },
        ],
      },
    ];
  }

  // ساخت content items برای تمام فایل‌ها
  const contentItems: InputContentType = [];

  for (const file of validFiles) {
    const dataUrl = await fileToDataUrl(file);

    if (file.type.startsWith("image/")) {
      contentItems.push({
        type: "input_image",
        image_url: dataUrl,
        detail: "high",
      });
    } else {
      contentItems.push({
        type: "input_file",
        filename: file.name,
        file_data: dataUrl,
      });
    }
  }

  // اضافه کردن prompt اصلی + userPrompt
  const finalText = `${prompt}

---

USER_PROMPT:

${request.userPrompt?.trim() || "(no additional prompt provided)"}

---`;

  contentItems.push({
    type: "input_text",
    text: finalText,
  });

  return [
    {
      role: "user",
      content: contentItems,
    },
  ];
}
function parseAndValidateExtraction(output: string | undefined) {
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

    throw new Error("AI returned invalid JSON.", {
      cause: error,
    });
  }

  const result = RequestGenerationOutputSchema.safeParse(data);

  if (!result.success) {
    console.error("AI response validation failed:", {
      issues: result.error.issues,
    });

    throw result.error;
  }

  return result.data;
}
export default async function requestGeneraton(
  request: RequestGenerationInput,
  options: RetryOptions = { maxRetries: 3, baseDelayMs: 1000 },
) {
  const { instructions, prompt } = await getConversationInstructions();
  const defaultReq = loadDefaultRequest();
  const extractionSchema = {
    name: "RequestGenerationOutputSchema",
    schema: RequestGenerationOutputSchema.toJSONSchema(),
  };

  let input = await buildExtractionInput(request, prompt);
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  let previousOutput = "";

  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      attempts++;

      const response = await createExtractionResponse({
        model: request.model ? request.model : defaultReq.model,
        instructions,
        input,
        extractionSchema,
      });
      previousOutput = response.output_text;

      return parseAndValidateExtraction(response.output_text);
    } catch (error) {
      console.error(`Extraction attempt ${attempts} failed:`, error);

      if (attempts > maxRetries) {
        throw new Error(`Failed to extract data after ${maxRetries} retries.`, { cause: error });
      }

      if (error instanceof ZodError) {
        const errorDetails = JSON.stringify(error.format(), null, 2);

        input = [
          {
            role: "system",
            content: `Your previous output failed Zod validation.

Review the previous output and the validation errors below.
Return a corrected JSON object that strictly follows the schema.

---
Previous output:
${previousOutput}

---
Zod Error Details:
${errorDetails}
---`,
          },
          ...input,
        ];

        // بدون تاخیر زمانی مجدداً درخواست را می‌فرستیم چون مشکل از ساختار است نه شبکه
        continue;
      }
      // Everything else = service/network/unexpected error
      else {
        // محاسبه Exponential Backoff: مثلاً 1000ms، سپس 2000ms، سپس 4000ms
        const backoffTime = baseDelayMs * Math.pow(2, attempts - 1);
        console.warn(
          `Network or Rate Limit error detected. Retrying in ${backoffTime}ms (Attempt ${attempts}/${maxRetries})...`,
        );

        await delay(backoffTime);
        continue;
      }
    }
  }

  throw new Error("Unexpected end of extraction retry loop.");
}
