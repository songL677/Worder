import type { ProtectedSegment } from "@/types/document";

const FENCE_RE = /^\s*(```+|~~~+)/;

function isMathFence(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("$$")) {
    return false;
  }
  return trimmed === "$$" || !trimmed.slice(2).includes("$$");
}

export function splitProtectedSegments(input: string): ProtectedSegment[] {
  const normalized = input.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const segments: ProtectedSegment[] = [];
  let buffer: string[] = [];

  const flushText = () => {
    if (buffer.length > 0) {
      segments.push({ kind: "text", content: buffer.join("\n") });
      buffer = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (FENCE_RE.test(line)) {
      flushText();
      const fence = line.trim().slice(0, 3);
      const codeLines = [line];
      index += 1;
      while (index < lines.length) {
        codeLines.push(lines[index]);
        if (lines[index].trim().startsWith(fence)) {
          break;
        }
        index += 1;
      }
      segments.push({ kind: "code", content: codeLines.join("\n") });
      continue;
    }

    if (isMathFence(line)) {
      flushText();
      const mathLines = [line.trim()];
      const singleLine = line.trim().length > 4 && line.trim().endsWith("$$");
      if (!singleLine) {
        index += 1;
        while (index < lines.length) {
          mathLines.push(lines[index]);
          if (lines[index].trim().endsWith("$$")) {
            break;
          }
          index += 1;
        }
      }
      segments.push({ kind: "math", content: mathLines.join("\n") });
      continue;
    }

    buffer.push(line);
  }

  flushText();
  return segments;
}
