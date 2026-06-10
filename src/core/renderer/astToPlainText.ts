import type { DocumentNode, WorderDocument } from "@/core/ast/types";

function nodeToText(node: DocumentNode): string {
  switch (node.type) {
    case "heading":
    case "paragraph":
    case "quote":
      return node.text;
    case "list":
      return node.items.map((item) => `- ${item.text}`).join("\n");
    case "listItem":
      return `- ${node.text}`;
    case "codeBlock":
      return node.code;
    case "table":
      return [node.headers.join("\t"), ...node.rows.map((row) => row.join("\t"))].join("\n");
    case "formula":
      return node.value;
    default:
      return "";
  }
}

export function astToPlainText(document: WorderDocument): string {
  return document.nodes
    .filter((node) => !(node.type === "formula" && node.mode === "inline"))
    .map(nodeToText)
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
