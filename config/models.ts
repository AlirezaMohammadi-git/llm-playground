import modelsJson from "./models.json";
import conversationModelsJson from "./conversation_models.json";

export type ModelOption = {
  label: string;
  value: string | null;
};

export const models: ModelOption[] = modelsJson as ModelOption[];
export const conversationModels: ModelOption[] = conversationModelsJson as ModelOption[];
