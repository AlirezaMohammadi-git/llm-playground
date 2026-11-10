"use server";

import "server-only";
import promptConfig from "@/prompts/generate/index.json";
import supportEmailConfig from "@/prompts/dataExtraction/supportEmail.json";
import resumeConfig from "@/prompts/dataExtraction/resume.json";
import invoiceConfig from "@/prompts/dataExtraction/invoice.json";

import type { DataType, ExtractionConfig, ExtractionConfigType } from "@/types/dataExtraction";

import { getInstructionVersion } from "../api/LoadDefaults";

type PromptConfigType = Record<
  string,
  {
    instructions: string;
  }
>;

const generateConfig = promptConfig as PromptConfigType;

const extractionConfigs: Record<DataType, ExtractionConfigType> = {
  EMAIL: supportEmailConfig as ExtractionConfigType,
  RESUME: resumeConfig as ExtractionConfigType,
  INVOICE: invoiceConfig as ExtractionConfigType,
};

/**
 * Get generate instructions for a specific version.
 */
export default async function getGenerateInstructions(version = "v1"): Promise<string> {
  const promptData = generateConfig[version];

  if (!promptData) {
    throw new Error(`Generate configuration for version '${version}' not found.`);
  }

  if (!promptData.instructions) {
    throw new Error(`Generate instructions for version '${version}' are missing.`);
  }

  return promptData.instructions;
}

/**
 * Get extraction prompt and instructions for a specific data type and version.
 */
export async function getExtractionInstruction(
  type: DataType,
  version?: string,
): Promise<ExtractionConfig> {
  const activeVersion = version ?? getInstructionVersion(type);
  const activeConfig = extractionConfigs[type];

  if (!activeConfig) {
    throw new Error(`Extraction configuration for type '${type}' not found.`);
  }

  const promptData = activeConfig[activeVersion];

  if (!promptData) {
    throw new Error(
      `Extraction configuration for type '${type}' and version '${activeVersion}' not found.`,
    );
  }

  if (!promptData.prompt) {
    throw new Error(
      `Extraction prompt for type '${type}' and version '${activeVersion}' is missing.`,
    );
  }

  if (!promptData.instructions) {
    throw new Error(
      `Extraction instructions for type '${type}' and version '${activeVersion}' are missing.`,
    );
  }

  return promptData;
}
