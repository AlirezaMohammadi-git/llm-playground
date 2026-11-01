export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  status?: number;
  response?: string;
  createdAt: string;
}
