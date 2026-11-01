export default function getInstructionsPrompt() {
  return `You are a helpful assistant.
Constrains:
- Only respond in English.
- If you don't know the answer, say 'I don't know'.
- OutputFormat: Markdown.
`;
}
