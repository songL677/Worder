import type { CleanMode } from "@/types/document";
import type { WorderDocument } from "@/core/ast/types";
import { splitProtectedSegments } from "@/core/cleaner/protectBlocks";
import { cleanTextSegment, enforceMarkdownSpacing } from "@/core/cleaner/normalizeWhitespace";
import { markdownToAst } from "@/core/parser/markdownToAst";
import { astToMarkdown } from "@/core/renderer/astToMarkdown";
import { astToPlainText } from "@/core/renderer/astToPlainText";

export interface ProcessInputOptions {
  mode: CleanMode;
}

export interface ProcessInputResult {
  markdown: string;
  plainText: string;
  document: WorderDocument;
  warnings: string[];
}

const LONG_TEXT_WARNING_LIMIT = 120_000;

function detectWarnings(input: string): string[] {
  const warnings: string[] = [];
  if (!input.trim()) {
    warnings.push("请输入或粘贴需要整理的内容。");
  }
  if (input.length > LONG_TEXT_WARNING_LIMIT) {
    warnings.push("文本较长，预览或导出可能会变慢，建议分段处理。");
  }
  if ((input.match(/```/g)?.length ?? 0) % 2 !== 0) {
    warnings.push("检测到代码块标记可能未闭合，已尽量保留原始内容。");
  }
  if ((input.match(/\$\$/g)?.length ?? 0) % 2 !== 0) {
    warnings.push("检测到块级公式标记可能未闭合，已尽量保留公式文本。");
  }
  return warnings;
}

function cleanToMarkdown(input: string, mode: CleanMode): string {
  const segments = splitProtectedSegments(input.replace(/\r\n?/g, "\n"));
  return enforceMarkdownSpacing(
    segments
      .map((segment) => {
        if (segment.kind === "text") {
          return cleanTextSegment(segment.content, mode === "structure");
        }
        return segment.content.trim();
      })
      .filter(Boolean)
      .join("\n\n")
  );
}

export function processInput(input: string, options: ProcessInputOptions): ProcessInputResult {
  const cleanedMarkdown = cleanToMarkdown(input, options.mode);
  const document = markdownToAst(cleanedMarkdown);
  const markdown = astToMarkdown(document);
  const plainText = astToPlainText(document);

  return {
    markdown,
    plainText,
    document,
    warnings: detectWarnings(input)
  };
}
