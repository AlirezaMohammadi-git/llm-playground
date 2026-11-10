import z from "zod";
import {
  DataTypeSchema,
  RequestExtractionInputSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";

export type DataType = z.infer<typeof DataTypeSchema>;

export type RequestExtractionInput = z.infer<typeof RequestExtractionInputSchema>;

export type ExtractionConfigType = {
  "1": {
    prompt: string;
    instructions: string;
  };
  [key: string]: {
    prompt: string;
    instructions: string;
  };
};

export type ExtractionConfig = {
  prompt: string;
  instructions: string;
};
