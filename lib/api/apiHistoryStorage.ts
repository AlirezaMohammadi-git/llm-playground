import "client-only";

import { z } from "zod";

import { ResponseResultSchema } from "@/lib/validation/request";

type ApiRequest = z.infer<typeof ResponseResultSchema>;

const STORAGE_KEY = "api-request-history";

export function getApiRequests(): ApiRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const result = ResponseResultSchema.array().safeParse(JSON.parse(stored));

    if (!result.success) {
      console.error("Failed to validate stored API requests:", result.error);

      return [];
    }

    return result.data;
  } catch (error) {
    console.error("Failed to read API requests from localStorage:", error);

    return [];
  }
}

async function saveApiRequests(requests: ApiRequest[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Failed to save API requests:", error);
  }
}

export async function createApiRequests(request: ApiRequest[]): Promise<ApiRequest[]> {
  const requests = getApiRequests();

  await saveApiRequests([...requests, ...request]);

  return request;
}

export async function deleteApiRequest(id: ApiRequest["id"]): Promise<boolean> {
  const requests = getApiRequests();

  const filteredRequests = requests.filter((request) => request.id !== id);

  if (filteredRequests.length === requests.length) {
    return false;
  }

  await saveApiRequests(filteredRequests);

  return true;
}

export async function clearApiRequests(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear API requests from localStorage:", error);
  }
}
