import type { DocumentNode, ListNode, WorderDocument } from "@/core/ast/types";

function listToMarkdown(node: ListNode, depth = 0): string {
  return node.items
    .map((item, index) => {
      const marker = node.ordered ? `${index + 1}.` : "-";
      const line = `${"  ".repeat(depth)}${marker} ${item.text}`;
      const children = item.children?.map((child) => listToMarkdown(child, depth + 1)).join("\n");
      return children ? `${line}\n${children}` : line;
    })
    .join("\n");
}

function nodeToMarkdown(node: DocumentNode): string {
  switch (node.type) {
    case "heading":
      return `${"#".repeat(node.depth)} ${node.text}`;
    case "paragraph":
      return node.text;
    case "list":
      return listToMarkdown(node);
    case "listItem":
      return `- ${node.text}`;
    case "codeBlock":
      return `\`\`\`${node.language ?? ""}\n${node.code}\n\`\`\``;
    case "table":
      return [
        `| ${node.headers.join(" | ")} |`,
        `| ${node.headers.map(() => "---").join(" | ")} |`,
        ...node.rows.map((row) => `| ${row.join(" | ")} |`)
      ].join("\n");
    case "formula":
      return node.mode === "block" ? `$$\n${node.value}\n$$` : `$${node.value}$`;
    case "quote":
      return `> ${node.text}`;
    default:
      return "";
  }
}

export function astToMarkdown(document: WorderDocument): string {
  const nodes = document.nodes.filter((node) => !(node.type === "formula" && node.mode === "inline"));
  let output = "";

  nodes.forEach((node, index) => {
    const rendered = nodeToMarkdown(node);
    if (!rendered) {
      return;
    }
    if (!output) {
      output = rendered;
      return;
    }
    const previous = nodes[index - 1];
    const tight = previous?.type === "list" && node.type === "list";
    output += `${tight ? "\n" : "\n\n"}${rendered}`;
  });

  return output.replace(/\n{3,}/g, "\n\n").trim();
}
