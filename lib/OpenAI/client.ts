"use server";

import OpenAI from "openai";

const apiKey = process.env.AVALAI_API_KEY || process.env.NEXT_PUBLIC_AVALAI_API_KEY;
const baseURL = process.env.AVALAI_BASE_URL || process.env.NEXT_PUBLIC_AVALAI_BASE_URL;

if (!apiKey) {
  throw new Error("API Key is missing. Please check your environment variables.");
}

const client = new OpenAI({
  apiKey,
  baseURL,
});

export async function getClient() {
  return client;
}
