"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

interface MarkdownPreviewProps {
  markdown: string;
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  return (
    <div className="preview-document prose prose-neutral max-w-none prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:text-steel prose-pre:shadow-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }], rehypeHighlight]}
      >
        {markdown || "整理后的内容会显示在这里。"}
      </ReactMarkdown>
    </div>
  );
}
