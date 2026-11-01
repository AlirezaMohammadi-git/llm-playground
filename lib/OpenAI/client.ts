import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY, // حتماً در .env.local یا environment variables قرار دهید
  baseURL: process.env.AVALAI_BASE_URL, // دامنه اصلی پیشنهادی
});
