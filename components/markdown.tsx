// components/markdown.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
  className?: string;
  rtl?: boolean;
}

export function Markdown({ children, className, rtl }: MarkdownProps) {
  return (
    <div dir={rtl ? "rtl" : "ltr"} className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
