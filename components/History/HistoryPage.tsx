"use client";

import { useEffect, useState } from "react";
import { clearApiRequests, getApiRequests } from "@/lib/api/apiHistoryStorage";
import HistoryItem from "./HistoryItem";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ResponseResultSchema } from "@/lib/validation/request";

type ApiRequestType = z.infer<typeof ResponseResultSchema>;

export default function HistoryPage() {
  const router = useRouter();
  const [apiRequests, setApiRequests] = useState<ApiRequestType[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // بارگذاری داده‌ها پس از Mount شدن برای جلوگیری از خطای Hydration و هماهنگی با کلاینت
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setIsMounted(true);
    const requests = getApiRequests();
    if (requests) {
      setApiRequests(requests);
    }
  }, []);

  const handleClearHistory = () => {
    clearApiRequests();
    setApiRequests([]); // به‌روزرسانی State بدون نیاز به reload کامل صفحه
  };

  // تا زمانی که کامپوننت روی کلاینت مونت نشده، از رندر محتوای وابسته به استوریج خودداری می‌کنیم
  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">API Request History</h1>
            {apiRequests.length > 0 && (
              <Button variant="destructive" onClick={handleClearHistory}>
                Clear History
              </Button>
            )}
          </div>

          {apiRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No request history found.</p>
          ) : (
            // فرض بر این است که درخواست‌ها دارای یک فیلد شناسه یکتا مثل id یا created_at هستند
            // در غیر این صورت از ایندکس یا ترکیب فیلدها استفاده کنید
            apiRequests.map((request, index) => (
              <HistoryItem key={request.created_at || index} request={request} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
