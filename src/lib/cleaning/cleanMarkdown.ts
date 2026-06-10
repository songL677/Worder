import type { CleanOptions, CleanResult } from "@/types/document";
import { splitProtectedSegments } from "./protect";
import { cleanTextSegment, enforceMarkdownSpacing, toPlainText } from "./textTransforms";

const SAMPLE_WARNING_LIMIT = 120_000;

export function cleanMarkdown(input: string, options: CleanOptions): CleanResult {
  const warnings: string[] = [];
  const source = input.replace(/\r\n?/g, "\n");

  if (source.length > SAMPLE_WARNING_LIMIT) {
    warnings.push("文本较长，导出 Word/PDF 时可能需要更久。");
  }

  const segments = splitProtectedSegments(source);
  const markdown = enforceMarkdownSpacing(
    segments
      .map((segment) => {
        if (segment.kind === "text") {
          return cleanTextSegment(segment.content, options.mode === "structure");
        }
        return segment.content.trim();
      })
      .filter(Boolean)
      .join("\n\n")
  );

  return {
    markdown,
    plainText: toPlainText(markdown),
    warnings
  };
}
