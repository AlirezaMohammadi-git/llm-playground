# LLM Playground

A Next.js application for comparing LLM responses and extracting structured data from support emails, resumes, and invoices through an OpenAI-compatible API.

## Features

### Playground

The home page (`/`) runs two generation requests side by side so you can compare models and settings with a shared prompt. Configure provider/model settings and parameters such as temperature, max tokens, top P, and top K. Responses include timing, token usage, and estimated cost when the provider supplies those values.

### History

The `/history` page displays generation runs saved in browser `localStorage`. This is a client-side history, not a server-backed database; entries can be reviewed and cleared in the UI.

### Structured data extraction

The `/extract-data` page supports:

- **Support emails:** submit email text to extract ticket type, order number, customer, purchase timeframe, issue, and requested resolution.
- **Resumes:** upload a resume to extract personal information, work experience, education, skills, certifications, and languages.
- **Invoices:** upload an invoice to extract its number, date, recipient, line items, and total due.

Email text is sent as text; resumes and invoices are uploaded as files, including PDFs and supported images. Extraction uses OpenAI Structured Outputs with JSON schemas, then validates results with Zod before returning them.

The versioned extraction prompts support documents written in different languages. Extracted narrative text is translated into Persian; proper names in resumes are preserved. Invoice amounts retain the invoice's currency, dates use the Gregorian calendar, and missing or unresolvable values are represented as `null` where allowed by the schema.

Extraction requests retry on failures (up to three retries by default). Invalid structured output triggers a correction attempt with validation details, while service or network failures use exponential backoff. Email extraction uses `DEFAULT_MODEL`; resume and invoice extraction use `DEFAULT_FILE_MODEL`.

## Routes

| Route           | Description                                      |
| --------------- | ------------------------------------------------ |
| `/`             | Model comparison playground                      |
| `/history`      | Browser-saved generation history                 |
| `/extract-data` | Structured email, resume, and invoice extraction |
| `/api/generate` | Generation API                                   |
| `/api/extract`  | Structured extraction API                        |

The extraction API accepts JSON requests and multipart form uploads. Invalid request data is rejected before extraction.

## Tech stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS
- OpenAI SDK and an OpenAI-compatible provider
- Zod schemas for request and extraction-result validation
- Browser `localStorage` for generation history

## Project structure

- `app/` — application pages, layouts, and API routes
- `components/` — shared UI and playground, history, and extraction components
- `lib/` — provider integration, extraction logic, prompt loading, validation, and history storage
- `prompts/` — versioned generation and extraction prompt configurations
- `types/` — shared TypeScript types
- `scripts/eval-extraction.ts` — extraction dataset evaluation script
- `test/raw/` — sample email, resume, and invoice inputs
- `test/output/` — sample structured extraction outputs

## Requirements and setup

Prerequisites: Node.js and pnpm.

Install dependencies:

```bash
pnpm install
```

Create `.env.local` in the project root:

```dotenv
AVALAI_BASE_URL=https://your-provider.example/v1
AVALAI_API_KEY=your-api-key
DEFAULT_MODEL=openai/gpt-4o-mini
DEFAULT_FILE_MODEL=your-file-capable-model

# Optional extraction prompt-version overrides
EMAIL_CONFIG_VERSION=1
RESUME_CONFIG_VERSION=1
INVOICE_CONFIG_VERSION=1
```

`AVALAI_BASE_URL`, `AVALAI_API_KEY`, `DEFAULT_MODEL`, and `DEFAULT_FILE_MODEL` are required. The first two configure the OpenAI-compatible provider; `DEFAULT_MODEL` is used for generation and email extraction, while `DEFAULT_FILE_MODEL` is used for resume and invoice extraction. Keep API keys in server-side environment variables and never commit them.

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Create and run a production build:

```bash
pnpm build
pnpm start
```

## Extraction evaluation

The evaluation script runs extraction against the samples in `test/raw/email`, `test/raw/resume`, and `test/raw/invoice`. It reports successful and failed requests and exits with a non-zero status if the success rate is below 90%. It checks extraction execution success; it does not compare results to the sample files in `test/output`.

Ensure `.env.local` is configured, then run:

```bash
pnpm eval:extraction
```

To print the details of failed cases:

```bash
EVAL_VERBOSE=1 pnpm eval:extraction
```

## Example workflow

1. Use the playground to compare two models with the same prompt and adjust one setting at a time.
2. Review response quality, latency, token usage, and any cost information returned by the provider.
3. Use the extractor to turn support email text or uploaded resume and invoice files into validated structured data.
4. Run the extraction evaluation after changing extraction prompts or behavior.

## Notes

- Requests and extraction results are validated with Zod.
- Extraction prompt versions can be selected independently with `EMAIL_CONFIG_VERSION`, `RESUME_CONFIG_VERSION`, and `INVOICE_CONFIG_VERSION`; each defaults to version `1`.
- Generation history is intentionally stored only in the browser and is not synchronized to a backend.
