// app/api/generate/route.ts

import { NextResponse } from "next/server";
import { generate } from "@/lib/api/Generate";
import { GenerateSchema } from "@/lib/validation/request";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const safeBody = GenerateSchema.safeParse(body);

    if (!safeBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request" + (safeBody.error ? `: ${safeBody.error.message}` : ""),
          details: safeBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await generate(safeBody.data);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate response" + (error instanceof Error ? `: ${error.message}` : ""),
      },
      {
        status: 500,
      },
    );
  }
}
