import { RequestExtractionInput } from "@/types/dataExtraction";
import {
  ExtractionApiResponse,
  ExtractionApiResponseSchema,
} from "@/lib/validation/extractData/ExtractZodTypes";

//################################################################################
export const fetchExtraction = async (
  rawData: RequestExtractionInput,
): Promise<ExtractionApiResponse> => {
  // Fix: Email input isn't working

  const formData = new FormData();
  if (rawData.requestType === "EMAIL") {
    if (!rawData.email) throw new Error("Raw Email can't be empty.");

    formData.append("email", rawData.email);
  }

  formData.append("requestType", rawData.requestType);

  if (rawData.file) {
    // اگر فایل از نوع File یا رشته باشد، به راحتی به FormData اضافه می‌شود
    formData.append("file", rawData.file);
  }

  const response = await fetch("/api/extract", {
    method: "POST",
    body: formData,
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(`API returned invalid JSON. Status: ${response.status}`);
  }

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;
    const errorMessage =
      typeof errorData === "object" && errorData !== null && typeof errorData.error === "string"
        ? errorData.error
        : `API request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  const apiResponse = ExtractionApiResponseSchema.safeParse(data);

  if (!apiResponse.success) {
    console.error("Invalid extraction API response:", apiResponse.error.issues);
    throw new Error(`Invalid extraction API response: ${apiResponse.error.message}`);
  }

  return apiResponse.data;
};
