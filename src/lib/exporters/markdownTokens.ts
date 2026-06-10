import { marked } from "marked";

export type MarkdownToken = ReturnType<typeof marked.lexer>[number];

export function lexMarkdown(markdown: string): MarkdownToken[] {
  return marked.lexer(markdown, { gfm: true });
}

export function stripMarkdownInline(value: string): string {
  return value
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .trim();
}
