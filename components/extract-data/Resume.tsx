"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Loader2, Upload, FileText, X, Info } from "lucide-react";
import { RequestExtractionInput } from "@/types/dataExtraction";
import {
  ExtractionApiResponse,
  ExtractionApiResponseSchema,
  Resume,
  ResumeSchema,
} from "@/lib/validation/extractData/dataExtractionValidator";

export default function ResumeExtraction() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<[string, string] | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // مدیریت انتخاب و شبیه‌سازی آپلود فایل
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setFile(file);
    setError(null);
  };

  // حذف فایل انتخاب شده
  const handleRemoveFile = () => {
    setError(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl place-self-center p-4">
      <h3 className="text-lg font-semibold">Raw Resume</h3>

      {/* Input مخفی برای انتخاب فایل */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,image/*"
      />

      <div className="w-full grid gap-2">
        {/* نمایش نام فایل و نوار پیشرفت هنگام آپلود */}
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
            disabled={isProcessing || !file}
            onClick={async () => {
              if (!file) {
                await handleExtractRequest(setIsProcessing, file, setError, setResume);
              } else {
                await handleExtractRequest(setIsProcessing, file, setError, setResume);
              }
            }}
          >
            {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isProcessing ? "Thinking" : "Process"}
          </Button>
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
      </div>

      {resume && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Result</h3>
          <ResultSectionUI resume={resume} />
        </div>
      )}
    </div>
  );
}

async function handleExtractRequest(
  setIsProcessing: (value: boolean) => void,
  file: File | null,
  setError: (e: [string, string] | null) => void,
  setResume: (r: Resume | null) => void,
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
      requestType: "RESUME",
      file: file,
    });

    if (!res.success || !res.result) {
      setError(["Failed while requesting to server.", ``]);
      return;
    }

    const validated = ResumeSchema.safeParse(res.result);

    // اصلاح منطق شرط: چون res.success قبلاً بررسی شده، فقط باید خطای validated بررسی شود
    if (!validated.success) {
      setError(["An error happened during processing your request.", validated.error.message]);
      return;
    }

    setResume(validated.data);
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
    // نکته مهم: هیدر Content-Type را حذف کنید تا مرورگر آن را خودکار تنظیم کند
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

function ResultSectionUI({ resume }: { resume: Resume }) {
  if (!resume) return null;

  const personalInfo = resume.personal_info;
  const experience = resume.experience ?? [];
  const skills = resume.skills ?? [];
  const certifications = resume.certifications ?? [];
  const languages = resume.languages ?? [];

  const hasText = (value: string | null | undefined): value is string =>
    typeof value === "string" && value.trim().length > 0;

  const isPersian = (value: string | null | undefined) =>
    hasText(value) && /[\u0600-\u06FF]/.test(value);

  const hasPersianData = [
    personalInfo?.name,
    personalInfo?.title,
    personalInfo?.location,
    personalInfo?.summary,
    ...experience.flatMap((item) => [
      item?.role,
      item?.company,
      item?.period,
      ...(item?.highlights ?? []),
    ]),
    ...skills,
    ...certifications,
    ...languages,
  ].some((value) => isPersian(value));

  const textDirection = hasPersianData ? "rtl" : "ltr";

  const validExperience = experience.filter(
    (item) =>
      item &&
      (hasText(item.role) ||
        hasText(item.company) ||
        hasText(item.period) ||
        (item.highlights?.length ?? 0) > 0),
  );

  const hasEducation =
    resume.education &&
    (hasText(resume.education.institution) ||
      hasText(resume.education.degree) ||
      hasText(resume.education.field_of_study) ||
      hasText(resume.education.graduation_year));

  return (
    <section
      dir={textDirection}
      lang={hasPersianData ? "fa" : "en"}
      className="mt-6 w-full overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      {/* Header */}
      {personalInfo && (
        <div className="border-b bg-muted/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {hasText(personalInfo.name) && (
                <h2 className="text-2xl font-bold tracking-tight">{personalInfo.name}</h2>
              )}

              {hasText(personalInfo.title) && (
                <p className="mt-1 text-base font-medium text-primary">{personalInfo.title}</p>
              )}
            </div>

            <div
              className={`flex flex-col gap-1 text-sm text-muted-foreground ${
                textDirection === "rtl" ? "items-start" : "items-end text-right"
              }`}
            >
              {hasText(personalInfo.location) && <span>{personalInfo.location}</span>}

              {hasText(personalInfo.email) && (
                <span className="break-all">{personalInfo.email}</span>
              )}

              {hasText(personalInfo.phone) && <span dir="ltr">{personalInfo.phone}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-7 p-6">
        {/* Summary */}
        {hasText(personalInfo?.summary) && (
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "خلاصه حرفه‌ای" : "Summary"}
            </h3>

            <p className="whitespace-pre-line text-sm leading-7">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {validExperience.length > 0 && (
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "سوابق کاری" : "Experience"}
            </h3>

            <div className="space-y-6">
              {validExperience.map((item, index) => {
                if (!item) return null;

                const highlights = item.highlights ?? [];

                return (
                  <article
                    key={`${item.company ?? "company"}-${item.role ?? "role"}-${index}`}
                    className="relative border-s-2 ps-4"
                  >
                    <div className="absolute -start-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        {hasText(item.role) && <h4 className="font-semibold">{item.role}</h4>}

                        {hasText(item.company) && (
                          <p className="text-sm text-muted-foreground">{item.company}</p>
                        )}
                      </div>

                      {hasText(item.period) && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          {item.period}
                        </span>
                      )}
                    </div>

                    {highlights.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-6">
                        {highlights.filter(hasText).map((highlight, highlightIndex) => (
                          <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEducation && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "تحصیلات" : "Education"}
            </h3>

            <div className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  {hasText(resume.education?.degree) && (
                    <h4 className="font-semibold">{resume.education.degree}</h4>
                  )}

                  {hasText(resume.education?.field_of_study) && (
                    <p className="text-sm text-muted-foreground">
                      {resume.education.field_of_study}
                    </p>
                  )}

                  {hasText(resume.education?.institution) && (
                    <p className="mt-1 text-sm">{resume.education.institution}</p>
                  )}
                </div>

                {hasText(resume.education?.graduation_year) && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {resume.education.graduation_year}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "مهارت‌ها" : "Skills"}
            </h3>

            <div className="flex flex-wrap gap-2">
              {skills.filter(hasText).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-full border bg-muted px-3 py-1.5 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "گواهینامه‌ها" : "Certifications"}
            </h3>

            <ul className="space-y-2 text-sm">
              {certifications.filter(hasText).map((certification, index) => (
                <li key={`${certification}-${index}`} className="rounded-lg border px-3 py-2">
                  {certification}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {hasPersianData ? "زبان‌ها" : "Languages"}
            </h3>

            <div className="flex flex-wrap gap-2">
              {languages.filter(hasText).map((language, index) => (
                <span
                  key={`${language}-${index}`}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
