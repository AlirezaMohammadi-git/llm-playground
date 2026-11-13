import { NextResponse } from "next/server";
import { z } from "zod";

import { requestExtraction } from "@/lib/api/dataExtraction/extractor";
import {
  DataTypeSchema,
  RequestExtractionInputSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json();

      const result = RequestExtractionInputSchema.safeParse(body);

      if (!result.success) {
        console.error("Request validation failed:", result.error.issues);

        return NextResponse.json(
          {
            error: "Invalid request",
            details: z.treeifyError(result.error),
          },
          { status: 400 },
        );
      }

      const extractionResult = await requestExtraction(result.data);

      return NextResponse.json({
        success: true,
        result: extractionResult,
      });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const rawRequestType = formData.get("requestType");
      const file = formData.get("file");

      const requestTypeResult = DataTypeSchema.safeParse(rawRequestType);

      if (!requestTypeResult.success) {
        return NextResponse.json(
          {
            error: "Invalid data-type for uploaded file",
          },
          { status: 400 },
        );
      }

      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            error: "File is required",
          },
          { status: 400 },
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          {
            error: "Uploaded file is empty",
          },
          { status: 400 },
        );
      }

      const extractionResult = await requestExtraction({
        requestType: requestTypeResult.data,
        file,
      });

      return NextResponse.json({
        success: true,
        result: extractionResult,
      });
    }

    return NextResponse.json(
      {
        error: "Unsupported Content-Type",
      },
      { status: 415 },
    );
  } catch (error) {
    console.error("Request extraction failed:", error);

    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      { status: 500 },
    );
  }
}
