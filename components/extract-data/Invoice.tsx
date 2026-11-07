"use client";

import { useState, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, Upload, FileText, X } from "lucide-react";

export default function InvoiceExtraction() {
  const [rawJson, setRawJson] = useState("");
  const [RawInvoice, setRawInvoice] = useState("");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // مدیریت انتخاب و شبیه‌سازی آپلود فایل
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    // شبیه‌سازی روند آپلود فایل (Progress)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 2000);
  };

  // حذف فایل انتخاب شده
  const handleRemoveFile = () => {
    setFileName("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // شبیه‌سازی فرآیند پردازش (Process)
  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setRawJson(
        JSON.stringify(
          {
            success: true,
            message: "Invoice extracted successfully",
            fileName: fileName || "manual-input.txt",
            content: RawInvoice || "Uploaded file parsed data",
          },
          null,
          2,
        ),
      );
      setIsProcessing(false);
    }, 1500);
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
        {/* Textarea برای متن دستی */}
        {!fileName && (
          <Textarea
            value={RawInvoice}
            onChange={(e) => setRawInvoice(e.target.value)}
            className="font-sm max-h-[256px]"
            placeholder="Write your raw invoice here or upload one..."
          />
        )}

        {/* نمایش نام فایل و نوار پیشرفت هنگام آپلود */}
        {fileName && (
          <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isUploading || isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* نوار پیشرفت (Progress Bar) */}
            {isUploading && (
              <div className="w-full flex flex-col gap-1">
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-right">
                  Uploading... {uploadProgress}%
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-row gap-2">
          <Button
            variant={"secondary"}
            className={"flex-1"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {fileName ? "Change file" : "Upload file"}
          </Button>

          <Button
            variant={"default"}
            className={"flex-1"}
            onClick={handleProcess}
            disabled={isUploading || isProcessing || (!fileName && !RawInvoice)}
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isProcessing ? "Processing..." : "Process"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Result</h3>
        {/* بخش نمایش نتیجه دلخواه */}
      </div>

      <div className="mt-2">
        <h3 className="text-lg font-semibold">Raw JSON</h3>
        <Textarea
          className="font-sm max-h-[256px] font-mono text-xs"
          readOnly
          value={rawJson}
          placeholder="Raw output json will appear here..."
        />
      </div>
    </div>
  );
}
