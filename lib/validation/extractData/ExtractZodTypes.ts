import { z } from "zod";

// ============================================================================
// 1. INPUT SCHEMAS
// ============================================================================

export const RequestDataExtractionSchema = z.object({
  model: z.string().min(1, "Model cannot be empty"),
  baseUrl: z.string().url("Base URL must be a valid URL"),
  apiKey: z.string().min(1, "API key cannot be empty"),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  temperature: z.number().min(0).max(2).nullish(),
  maxTokens: z.number().min(1).max(128000).nullish(),
  rawData: z.string().min(1, "Raw data cannot be empty"), // can be string/file binaries (PDF-IMAGE)
});

// ============================================================================
// 1. OUTPUT SCHEMAS
// ============================================================================

export const SupportEmailSchema = z.object({
  ticket_type: z.string(),
  order_number: z.string().nullable(),
  customer_name: z.string().nullable(),
  purchase_timeframe: z.string().nullable(),
  issue: z.string().nullable(),
  requested_resolution: z.string().nullable(),
});

export const ResumeSchema = z.object({
  personal_info: z
    .object({
      name: z.string().nullable(),
      title: z.string().nullable(),
      location: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      summary: z.string().nullable(),
    })
    .nullable(),

  experience: z.array(
    z
      .object({
        role: z.string().nullable(),
        company: z.string().nullable(),
        period: z.string().nullable(),
        highlights: z.array(z.string()).nullable(),
      })
      .nullable(),
  ),

  education: z
    .object({
      institution: z.string().nullable(),
      degree: z.string().nullable(),
      field_of_study: z.string().nullable(),
      graduation_year: z.string().nullable(),
    })
    .nullable(),

  skills: z.array(z.string()),

  certifications: z.array(z.string()),

  languages: z.array(z.string()),
});

export const InvoiceSchema = z.object({
  invoice_number: z.string(),
  date: z.string(),
  billed_to: z.string(),
  items: z.array(
    z.object({
      description: z.string(),
      amount: z.number(),
    }),
  ),
  total_due: z.number(),
});

export const ExtractionApiResponseSchema = z.object({
  success: z.boolean(),
  result: z.union([SupportEmailSchema, ResumeSchema, InvoiceSchema]).nullable(),
  error: z.string().nullish().optional(),
});

export const DataTypeSchema = z.enum({
  email: "EMAIL",
  resume: "RESUME",
  invoice: "INVOICE",
});

export const RequestExtractionInputSchema = z.object({
  requestType: DataTypeSchema,
  email: z.string().nullable().optional(),
  file: z
    .union([z.instanceof(File), z.string()])
    .nullable()
    .optional(),
});

export type SupportEmail = z.infer<typeof SupportEmailSchema>;
export type Resume = z.infer<typeof ResumeSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type RequestDataExtraction = z.infer<typeof RequestDataExtractionSchema>;
export type ExtractionApiResponse = z.infer<typeof ExtractionApiResponseSchema>;
