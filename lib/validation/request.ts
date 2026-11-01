import { z } from "zod";

// ============================================================================
// 1. INPUT SCHEMAS
// ============================================================================

export const GenerateSchema = z.object({
  model: z.string().min(1, "Model cannot be empty"),
  baseUrl: z.string().url("Base URL must be a valid URL"),
  apiKey: z.string().min(1, "API key cannot be empty"),
  prompt: z.string().min(1, "Prompt cannot be empty"),
  temperature: z.number().min(0).max(2).nullish(),
  maxTokens: z.number().min(1).max(128000).nullish(),
  topP: z.number().min(0).max(1).nullish(),
  topK: z.number().int().min(1).max(100).nullish(),
});

// ============================================================================
// 2. COMMON / SUB SCHEMAS
// ============================================================================

export const ContentItemSchema = z.object({
  type: z.string(),
  text: z.string(),
  annotations: z.array(z.unknown()),
});

export const OutputItemSchema = z.object({
  type: z.enum(["reasoning", "message"]),
  id: z.string(),
  status: z.string(),
  role: z.string(),
  content: z.array(ContentItemSchema),
  phase: z.string().nullable(),
});

export const InputTokensDetailsSchema = z.object({
  audio_tokens: z.number().nullable(),
  cached_tokens: z.number(),
  cached_tokens_details: z.unknown().nullable(),
  image_tokens: z.number().nullable(),
  text_tokens: z.number(),
  video_tokens: z.number().nullable(),
  cache_write_tokens: z.number(),
});

export const OutputTokensDetailsSchema = z.object({
  audio_tokens: z.number().nullable(),
  reasoning_tokens: z.number(),
  text_tokens: z.number(),
});

export const UsageSchema = z.object({
  input_tokens: z.number(),
  input_tokens_details: InputTokensDetailsSchema,
  output_tokens: z.number(),
  output_tokens_details: OutputTokensDetailsSchema,
  total_tokens: z.number(),
});

// ============================================================================
// 3. RESPONSE SCHEMAS
// ============================================================================

export const SimpleResponseSchema = z.object({
  id: z.string(),
  object: z.literal("response"),
  created_at: z.number(),
  model: z.string(),
  output_text: z.string(),
  usage: z
    .object({
      input_tokens: z.number(),
      output_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

export const CompletionChoiceSchema = z.object({
  index: z.number(),
  message: z.object({
    role: z.string(),
    content: z.string().nullable(),
  }),
  finish_reason: z.string().nullable(),
  logprobs: z.unknown().nullable().optional(),
});

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(CompletionChoiceSchema),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

export const ResponseResultSchema = z.object({
  id: z.string(),
  created_at: z.number(),
  error: z.unknown().nullable(),
  incomplete_details: z.unknown().nullable(),
  instructions: z.string(),
  model: z.string(),
  object: z.string(),
  output: z.array(OutputItemSchema),
  parallel_tool_calls: z.boolean(),
  temperature: z.number().nullable(),
  tool_choice: z.string(),
  tools: z.array(z.unknown()),
  top_p: z.number().nullable(),
  max_output_tokens: z.number().nullable(),
  previous_response_id: z.string().nullable(),
  reasoning: z.unknown().nullable(),
  status: z.string(),
  text: z.record(z.string(), z.unknown()),
  truncation: z.unknown().nullable(),
  usage: UsageSchema,
  service_tier: z.string(),
  output_text: z.string(),
  prompt: z.string().nullable().optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  result: ResponseResultSchema.nullable(),
});

// ============================================================================
// 4. TYPESCRIPT TYPE INFERENCE
// ============================================================================

export type GenerateInput = z.infer<typeof GenerateSchema>;
export type SimpleResponse = z.infer<typeof SimpleResponseSchema>;
export type CompletionChoice = z.infer<typeof CompletionChoiceSchema>;
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
export type ContentItem = z.infer<typeof ContentItemSchema>;
export type OutputItem = z.infer<typeof OutputItemSchema>;
export type UsageDetails = z.infer<typeof UsageSchema>;
export type ResponseResult = z.infer<typeof ResponseResultSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
