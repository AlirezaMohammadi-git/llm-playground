"use client";

import { Button } from "./ui/button";
import ThemeToggle from "./ui/ThemeToggle";

export default function NavigationBar() {
  return (
    <nav className="flex items-center justify-between w-full">
      <h1 className="text-xl font-bold">LLM Playground</h1>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => (window.location.href = "/history")}>
          History
        </Button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
