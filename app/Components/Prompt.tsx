export function Prompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Prompt</h2>
      <textarea
        className="w-full h-32 p-2 border border-gray-300 rounded"
        placeholder="Enter your prompt here..."
      ></textarea>
    </div>
  );
}
