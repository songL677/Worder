import type { CleanOptions, CleanResult } from "@/types/document";
import { processInput } from "@/core/pipeline/processInput";

export function cleanMarkdown(input: string, options: CleanOptions): CleanResult {
  return processInput(input, { mode: options.mode });
}
