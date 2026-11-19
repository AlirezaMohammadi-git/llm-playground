import { z } from "zod";

export const RequestGenerationInputSchema = z.object({
  model: z.string().nullable(),
  userPrompt: z.string(),
  files: z.array(z.instanceof(File).nullable()),
});
export const RequestGenerationOutputSchema = z.object({
  output_text: z.string(),
});

export type RequestGenerationInput = z.infer<typeof RequestGenerationInputSchema>;
export type RequestGenerationOutput = z.infer<typeof RequestGenerationOutputSchema>;
