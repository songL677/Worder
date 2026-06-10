import type { WorderDocument } from "@/core/ast/types";
import { astToMarkdown } from "@/core/renderer/astToMarkdown";
import { markdownToSlides } from "./markdownToSlides";

export function astToSlides(document: WorderDocument) {
  return markdownToSlides(astToMarkdown(document));
}
