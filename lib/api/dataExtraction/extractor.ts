"use server";

import "server-only";
import { getClient } from "@/lib/OpenAI/client";
import { getExtractionInstruction } from "@/lib/prompts/instructions";
import { loadDefaultRequest } from "../LoadDefaults";
import { RequestExtractionInput } from "@/types/dataExtraction";
import {
  InvoiceSchema,
  ResumeSchema,
  SupportEmailSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";
import { ZodSafeParseResult } from "zod";

/**
 * استخراج ساختاریافته اطلاعات تیکت پشتیبانی از ایمیل
 * با استفاده از Responses API و اعتبارسنجی Zod
 */
export async function requestExtraction(request: RequestExtractionInput) {
  const client = await getClient();
  const { instructions, prompt } = await getExtractionInstruction(request.requestType);
  const defaultReq = loadDefaultRequest();

  // ساخت پیام‌های ورودی مطابق با Responses API
  // - instructions: نقش سیستم / دستورالعمل کلی
  // - user: پرامپت وظیفه + محتوای واقعی ایمیل
  const input = [
    {
      role: "system" as const,
      content: instructions,
    },
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: `${prompt}

---
EMAIL CONTENT:
${request.email}
---`,
        },
      ],
    },
  ];

  const response = await client.responses.create({
    model: defaultReq.model,
    temperature: 0.1,
    // در Responses API بهتر است instructions را جداگانه هم ارسال کنیم
    // تا مدل آن را به‌عنوان system prompt قوی‌تر در نظر بگیرد
    instructions: instructions,
    input,
    // اگر مدل شما از Structured Outputs پشتیبانی می‌کند، این بخش را فعال کنید:
    text: {
      format: {
        type: "json_schema",
        name: "SupportEmailExtraction",
        schema: SupportEmailSchema.toJSONSchema(),
        strict: true,
      },
    },
  });

  const stringData = response.output_text;
  const data = JSON.parse(stringData);
  let validated: ZodSafeParseResult<unknown>;

  switch (request.requestType) {
    case "EMAIL":
      validated = SupportEmailSchema.safeParse(data);
      break;
    case "INVOICE":
      validated = InvoiceSchema.safeParse(data);
      break;
    case "RESUME":
      validated = ResumeSchema.safeParse(data);
      break;
    default:
      throw new Error("Unsupported extraction request type.");
  }

  if (!validated.success) {
    throw new Error("AI responsed invalid format." + ` - Error: ${validated.error}`);
  }

  return validated.data;
}
