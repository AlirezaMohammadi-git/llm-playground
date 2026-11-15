"use server";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requestExtraction } from "@/lib/api/dataExtraction/extractor";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rawDirectory = path.resolve(scriptDirectory, "../test/raw");

const mimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const groups = [
  { label: "EMAIL", directory: "email", requestType: "EMAIL" as const },
  { label: "RESUME", directory: "resume", requestType: "RESUME" as const },
  { label: "INVOICE", directory: "invoice", requestType: "INVOICE" as const },
];

async function evaluate(): Promise<void> {
  console.log("Extraction Evaluation\n");

  let total = 0;
  let successful = 0;

  for (const group of groups) {
    const directory = path.join(rawDirectory, group.directory);
    const files = (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    console.log(group.label);

    for (const filename of files) {
      total++;
      const filePath = path.join(directory, filename);

      try {
        if (group.requestType === "EMAIL") {
          const email = await readFile(filePath, "utf8");
          await requestExtraction({ requestType: group.requestType, email });
        } else {
          const extension = path.extname(filename).toLowerCase();
          const type = mimeTypes[extension];
          if (!type) throw new Error(`Unsupported file type: ${extension}`);

          const contents = await readFile(filePath);
          const file = new File([contents], filename, { type });
          await requestExtraction({ requestType: group.requestType, file });
        }

        successful++;
        console.log(`  ${filename.padEnd(8)} ✓`);
      } catch (error) {
        console.log(`  ${filename.padEnd(8)} ✗`);
        if (process.env.EVAL_VERBOSE === "1") {
          console.error(error);
        }
      }
    }

    console.log();
  }

  const failed = total - successful;
  const successRate = total === 0 ? 0 : (successful / total) * 100;
  const passed = successRate >= 90;

  console.log("--------------------------------");
  console.log(`Total:        ${total}`);
  console.log(`Successful:   ${successful}`);
  console.log(`Failed:       ${failed}`);
  console.log(`Success rate: ${successRate.toFixed(1)}%`);
  console.log();
  console.log(`${passed ? "PASS ✓" : "FAIL ✗"}`);
  console.log("Required: ≥90%");

  if (!passed) process.exitCode = 1;
}

evaluate().catch((error: unknown) => {
  console.error("Extraction evaluation could not run:", error);
  process.exitCode = 1;
});
