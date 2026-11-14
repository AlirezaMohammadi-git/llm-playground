"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailExtraction from "./Email";
import ResumeExtraction from "./Resume";
import InvoiceExtraction from "./Invoice";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { RequestExtractionInput } from "@/types/dataExtraction";
import {
  ExtractionApiResponse,
  ExtractionApiResponseSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";

export default function MainExtractionPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full px-4">
      <div className="mb-6">
        <Button variant="outline" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Data Extractor</h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <Tabs defaultValue="email" className="w-full flex flex-col items-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="email">Support Email</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>

          <div className="w-full mt-6">
            <TabsContent value="email" className="w-full">
              <EmailExtraction />
            </TabsContent>
            <TabsContent value="resume" className="w-full">
              <ResumeExtraction />
            </TabsContent>
            <TabsContent value="invoice" className="w-full">
              <InvoiceExtraction />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

//################################################################################
export const fetchExtraction = async (
  rawData: RequestExtractionInput,
): Promise<ExtractionApiResponse> => {
  const formData = new FormData();

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
