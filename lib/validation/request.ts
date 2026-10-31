import { z } from "zod";

export const GenerateSchema = z.object({
  model: z.string().refine((val) => val.trim() !== "", { message: "Model cannot be empty." }),
  baseUrl: z.url().refine((val) => val.trim() !== "", { message: "Base URL cannot be empty." }),
  apiKey: z.string().refine((val) => val.trim() !== "", { message: "API key cannot be empty." }),
  temperature: z.number().min(0).max(2).optional().nullable(),
  maxTokens: z.number().min(1).max(1000).optional().nullable(),
  topP: z.number().min(0).max(1).optional().nullable(),
  topK: z.number().int().min(1).max(100).optional().nullable(),
  prompt: z.string().min(1, { message: "Prompt cannot be empty." }),
});

export const CompletionChoiceSchema = z.object({
  index: z.number(),
  text: z.string(),
  finish_reason: z.string().nullable(),
  logprobs: z.unknown().nullable(),
});

export const CompletionResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    id: z.string(),
    object: z.string(),
    created: z.number(),
    model: z.string(),
    choices: z.array(CompletionChoiceSchema),
    usage: z.object({
      completion_tokens: z.number(),
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    }),
    estimated_cost: z
      .object({
        unit: z.string(),
        irt: z.number(),
        exchange_rate: z.number(),
      })
      .optional(),
  }),
});

// Extract Type from Schema
export type GenerateInput = z.infer<typeof GenerateSchema>;
export type CompletionResponse = z.infer<typeof CompletionResponseSchema>;
