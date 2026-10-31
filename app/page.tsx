import Playground from "@/components/playground/PlaygroundForm";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col p-6 sm:p-8">
      <header className="flex w-full items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Welcome to the LLM Playground</h1>

        <ThemeToggle />
      </header>

      <Playground />
    </main>
  );
}
