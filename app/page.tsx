import NavigationBar from "@/components/Navigation";
import Playground from "@/components/playground/PlaygroundForm";
import { loadDefaultState } from "@/lib/api/LoadDefaults";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col p-6 sm:p-8">
      <header className="flex w-full items-center justify-between gap-4">
        <NavigationBar />
      </header>

      <Playground defaultState={loadDefaultState()} />
    </main>
  );
}
