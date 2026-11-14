"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Loader2, Upload, FileText, X, Info } from "lucide-react";
import { Invoice, InvoiceSchema } from "@/lib/validation/extractData/dataExtractionValidator";
import { fetchExtraction } from "./MainPage";

async function handleProcess(
  setIsProcessing: (value: boolean) => void,
  file: File | null,
  setError: (e: [string, string] | null) => void,
  setInvoice: (i: Invoice | null) => void,
) {
  setIsProcessing(true);
  setError(null); // ریست کردن خطاهای قبلی در شروع درخواست جدید

  try {
    if (!file) {
      setError(["Empty file!", ""]);
      return;
    }

    // اصلاح بررسی سایز فایل با استفاده از پراپرتی استاندارد size
    if (file instanceof File && file.size === 0) {
      setError(["Failed to upload file", "File has zero bytes!"]);
      return;
    }

    const res = await fetchExtraction({
      requestType: "INVOICE",
      file: file,
    });

    if (!res.success || !res.result) {
      setError(["Failed while requesting to server.", ``]);
      return;
    }

    const validated = InvoiceSchema.safeParse(res.result);

    // اصلاح منطق شرط: چون res.success قبلاً بررسی شده، فقط باید خطای validated بررسی شود
    if (!validated.success) {
      setError(["An error happened during processing your request.", validated.error.message]);
      return;
    }

    setInvoice(validated.data);
    return;
  } catch (e) {
    if (e instanceof Error) {
      setError([`An error happened during processing your request.`, e.message]);
      return;
    } else {
      setError(["Request to server failed", ``]);
      return;
    }
  } finally {
    setIsProcessing(false);
  }
}

export default function InvoiceExtraction() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<[string, string] | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
  };
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl place-self-center p-4">
      <h3 className="text-lg font-semibold">Raw Invoice</h3>

      {/* Input مخفی برای انتخاب فایل */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,image/*"
      />

      <div className="w-full grid gap-2">
        {file && (
          <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile} disabled={isProcessing}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-row gap-2">
          <Button
            variant={"secondary"}
            className={"flex-1"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {file ? "Change file" : "Upload file"}
          </Button>

          <Button
            variant={"default"}
            className={"flex-1"}
            onClick={async () => {
              await handleProcess(setIsProcessing, file, setError, setInvoice);
            }}
            disabled={isProcessing || !file}
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isProcessing ? "Processing..." : "Process"}
          </Button>
        </div>
      </div>

      <div
        hidden={!error}
        className={`flex flex-row gap-2 items-center ${error?.[0] === "" ? "hidden" : ""} `}
      >
        <Info className={`text-destructive w-4 h-4 ${error?.[0] === "" ? "hidden" : ""}`} />
        <strong>
          <p className={`text-sm text-destructive`}>{error?.[1]}</p>
        </strong>
      </div>
      <div className={`${error?.[1] === "" ? "hidden" : ""} bg-card pl-5 rounded-2xl`}>
        <p className={`text-xs text-card-foreground`}>{error?.[1]}</p>
      </div>

      <div hidden={!invoice} className="mt-4">
        <h3 className="text-lg font-semibold">Result</h3>
        <div>
          <InvoiceDetails key={1} invoice={invoice} hidden={!invoice} />
        </div>
      </div>
    </div>
  );
}

export function InvoiceDetails({ invoice, hidden }: { invoice: Invoice | null; hidden: boolean }) {
  return !invoice ? (
    <div hidden={hidden}>
      <p className="text-destructive">No detail from uploaded invoice file!</p>
    </div>
  ) : (
    <section className="mx-auto w-full max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-start justify-between gap-6 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">#{invoice.invoice_number}</p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">{invoice.date}</p>
        </div>
      </header>

      <div className="mb-8">
        <p className="mb-1 text-sm text-gray-500">Billed to</p>
        <p className="font-medium">{invoice.billed_to}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={`${item.description}-${index}`} className="border-b">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td className="pt-5 text-right font-semibold">Total Due</td>
              <td className="pt-5 text-right text-lg font-bold">
                {invoice.total_due.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
