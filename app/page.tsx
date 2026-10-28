import { FieldSeparator } from "@/components/ui/field";
import Controls from "./Components/Controls";
import ThemeToggle from "./Components/ThemeToggle";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col p-6 sm:p-8">
      <header className="flex w-full items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Welcome to the LLM Playground</h1>
        <ThemeToggle />
      </header>
      <body className="flex flex-col items-start justify-start gap-4 mt-8 w-full">
        <h2 className="text-2xl font-extrabold mt-16">Controls</h2>
        <FieldSeparator className="my-1" />
        <div className="flex flex items-start justify-start gap-4 mt-4 w-full">
          {Controls(1)}
          {Controls(2)}
        </div>

        <PromptSection />
        <div className="flex items-start justify-start gap-4 mt-4 w-full">
          {ResponseSection(1)}
          {ResponseSection(2)}
        </div>
        <div className="mb-64"></div>
      </body>
    </div>
  );
}

function PromptSection() {
  return (
    <div className="flex flex-col items-start justify-start mt-8 w-full">
      <h2 className="text-2xl font-extrabold">Prompt</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea placeholder="Enter your prompt here..." />
        <Button variant="default">Send</Button>
      </div>
    </div>
  );
}

function ResponseSection(
  numberOfResponses: number = 1,
  response: string = "",
  hide: boolean = false,
) {
  return (
    <div className={` ${hide ? "hidden" : ""} flex flex-col items-start justify-start mt-8 w-full`}>
      <h2 className="text-2xl font-extrabold">Response {numberOfResponses}</h2>
      <div className="flex flex-col items-start justify-start gap-4 mt-4 w-full">
        <Textarea readOnly placeholder="Response will appear here..." value={response} />
      </div>
    </div>
  );
}
