# LLM Playground

A lightweight Next.js playground for experimenting with LLMs and extracting structured data from documents.

This project combines:

- a side-by-side model comparison UI for prompt testing
- a browser history view for saved runs
- a structured data extraction workspace for support emails, resumes, and invoices
- OpenAI-compatible API integration with schema validation

## Features

### 1) Playground

The main page at `/` lets you compare two LLM responses using the same prompt and different model settings.

Included capabilities:

- choose provider/model configuration per panel
- set values such as `temperature`, `maxTokens`, `topP`, and `topK`
- run two requests in parallel and inspect responses side by side
- view timing, token usage, and estimated cost when returned by the provider
- keep a local browser history of past requests and results

### 2) History

The `/history` page displays previously generated results saved in the browser via `localStorage`.

Notes:

- this is a client-side history, not a server-backed database
- it is useful for quick prompt iteration and manual comparison
- items can be reviewed and cleared from the UI

### 3) Data Extractor

The `/extract-data` page provides structured extraction workflows for:

- support emails
- resumes
- invoices

It accepts either:

- plain-text email content, or
- uploaded files such as PDFs, images, and documents

The app sends the content to the OpenAI Responses API with JSON schema enforcement and validates the returned output with Zod before displaying it.

## Tech stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- OpenAI SDK
- Zod validation
- localStorage-based history

## Project structure

- `app/` — routes and API handlers
  - `app/page.tsx` — main playground page
  - `app/history/page.tsx` — history UI
  - `app/extract-data/page.tsx` — extraction UI
  - `app/api/generate/route.ts` — generate endpoint
  - `app/api/extract/route.ts` — extraction endpoint
- `components/` — UI and feature-specific components
- `lib/` — API integrations, validation, prompts, and defaults
- `prompts/` — extraction prompt configs and instruction templates
- `types/` — shared TypeScript definitions
- `tmp/` — local scratch/test data ignored by git unless needed

## Environment variables

Create a `.env.local` file at the project root:

```dotenv
AVALAI_BASE_URL=https://your-provider.example/v1
AVALAI_API_KEY=your-api-key
DEFAULT_MODEL=openai/gpt-4o-mini

# Optional extraction-version overrides
EMAIL_CONFIG_VERSION=1
RESUME_CONFIG_VERSION=1
INVOICE_CONFIG_VERSION=1
```

Required values:

- `AVALAI_BASE_URL` — base URL for your OpenAI-compatible provider
- `AVALAI_API_KEY` — API key used by the server
- `DEFAULT_MODEL` — default model for generation and extraction requests

Important:

- keep API keys in server environment variables and do not commit them to the repository
- the app reads provider configuration on the server side

## Running the project

Prerequisites:

- Node.js
- pnpm

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open the app in your browser:

- http://localhost:3000

Routes:

- `/` — model comparison playground
- `/history` — saved generation history
- `/extract-data` — structured data extraction tools

Production build:

```bash
pnpm build
pnpm start
```

## Example workflow

1. Open the main playground and choose models and settings for both panels.
2. Use the same prompt for each side to make the comparison fair.
3. Change one variable at a time, such as `temperature`, to study its effect on responses.
4. Compare response quality, latency, token usage, and any returned cost information.
5. Use the Data Extractor to convert raw email, CV, or invoice content into structured JSON output.

## Notes

- generation and extraction requests are validated with Zod schemas before being accepted
- extraction outputs are constrained to JSON schema-based structures to improve reliability
- browser history is intentionally local-only and is not persisted in a backend database
