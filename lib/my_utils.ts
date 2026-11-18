// تابع کمکی برای ایجاد تاخیر زمانی (Delay)
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const models = [
  { label: "choose a model", value: null },
  { label: "gpt-6-luna", value: "openai/gpt-6-luna" },
  { label: "claude-opus-5.5", value: "anthropic/claude-opus-5.5" },
  { label: "gpt-4o", value: "openai/gpt-4o" },
  { label: "gpt-4o-mini", value: "openai/gpt-4o-mini" },
  { label: "claude-3.5-sonnet", value: "anthropic/claude-3.5-sonnet" },
  { label: "claude-3-opus", value: "anthropic/claude-3-opus" },
  { label: "claude-3-haiku", value: "anthropic/claude-3-haiku" },
  { label: "gemini-flash-1.5", value: "google/gemini-flash-1.5" },
  { label: "gemini-pro-1.5", value: "google/gemini-pro-1.5" },
  { label: "llama-3.1-70b-instruct", value: "meta-llama/llama-3.1-70b-instruct" },
  { label: "llama-3.1-405b-instruct", value: "meta-llama/llama-3.1-405b-instruct" },
  { label: "mistral-large", value: "mistralai/mistral-large" },
  { label: "deepseek-chat", value: "deepseek-chat" },
  { label: "gemma-4-26b-a4b-it", value: "gemma-4-26b-a4b-it" },
  { label: "cf.granite-4.0-h-micro", value: "cf.granite-4.0-h-micro" },
];

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
/** Convert Latin digits in a string/number to Persian digits: 1405 -> ۱۴۰۵ */
export function fa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export type ClassValue = string | number | bigint | null | undefined | false | ClassValue[];

/** Minimal class joiner (swap for clsx + tailwind-merge when the library grows). */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const i of inputs) {
    if (!i) continue;
    if (Array.isArray(i)) {
      const nested = cn(...i);
      if (nested) out.push(nested);
    } else {
      out.push(String(i));
    }
  }
  return out.join(" ");
}

/** Persian digits back to Latin (for parsing user input). */
export function en(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** Thousands-separated Persian number: 12450000 -> ۱۲٬۴۵۰٬۰۰۰ */
export function faNumber(value: number): string {
  return fa(Math.round(value).toLocaleString("en-US")).replace(/,/g, "٬");
}

/** Amount in toman with unit: 12450000 -> ۱۲٬۴۵۰٬۰۰۰ تومان */
export function formatToman(value: number): string {
  return `${faNumber(value)} تومان`;
}

/** Percent with Persian digits and the Persian percent sign: 18 -> ۱۸٪ */
export function faPercent(value: number, digits = 0): string {
  return `${fa(value.toFixed(digits))}٪`;
}

/** File size in Persian: 1258291 -> ۱٫۲ مگابایت */
export function faFileSize(bytes: number): string {
  if (bytes < 1024) return `${fa(bytes)} بایت`;
  if (bytes < 1024 ** 2) return `${fa((bytes / 1024).toFixed(0))} کیلوبایت`;
  return `${fa((bytes / 1024 ** 2).toFixed(1)).replace(".", "٫")} مگابایت`;
}

/** Deterministic PRNG; same seed → same sequence. Returns a function yielding [0, 1). sequence: mulberry32(1)() -> 0.627... */
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
