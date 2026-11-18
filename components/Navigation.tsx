"use client";

import { Button } from "./ui/button";
import ThemeToggle from "./ui/ThemeToggle";

export default function NavigationBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <h1 className="text-xl font-bold">LLM Playground</h1>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => (window.location.href = "/history")}>
          History
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/extract-data")}>
          Data Extractor
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/playground")}>
          playground
        </Button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
