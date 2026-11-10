import { NextResponse } from "next/server";
import { requestExtraction } from "@/lib/api/dataExtraction/extractor";
import { RequestExtractionInputSchema } from "@/lib/validation/extractData/dataExtractionValidator";
import { z } from "zod";

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    console.error("Request extraction failed:", error);

    return NextResponse.json(
      {
        error: "Failed to generate response",
      },
      { status: 500 },
    );
  }
}
