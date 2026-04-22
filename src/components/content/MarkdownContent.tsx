import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const normalizeMarkdown = (value: string) =>
  String(value ?? "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .trim();

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-invert prose-ruhang max-w-none",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="-mx-2 overflow-x-auto px-2">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}

export { normalizeMarkdown };
