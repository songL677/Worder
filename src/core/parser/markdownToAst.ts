import type {
  CodeBlockNode,
  DocumentNode,
  FormulaNode,
  ListItemNode,
  ListNode,
  TableNode
} from "@/core/ast/types";
import { createWorderDocument } from "@/core/ast/utils";
import { stripMarkdownInline } from "@/lib/exporters/markdownTokens";

function isTableSeparator(line: string): boolean {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTable(lines: string[], start: number): { node: TableNode; nextIndex: number } | null {
  const headerLine = lines[start]?.trim();
  const separatorLine = lines[start + 1]?.trim();
  if (!headerLine?.includes("|") || !separatorLine || !isTableSeparator(separatorLine)) {
    return null;
  }

  const readCells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => stripMarkdownInline(cell.trim()));

  const rows: string[][] = [];
  let index = start + 2;
  while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
    rows.push(readCells(lines[index]));
    index += 1;
  }

  return {
    node: {
      type: "table",
      headers: readCells(headerLine),
      rows
    },
    nextIndex: index
  };
}

interface ListRecord {
  indent: number;
  marker: string;
  text: string;
}

function buildList(records: ListRecord[], start: number, indent: number): { node: ListNode; nextRecord: number } {
  const ordered = /\d+[.)]/.test(records[start].marker);
  const items: ListItemNode[] = [];
  let index = start;

  while (index < records.length) {
    const record = records[index];
    if (record.indent < indent) {
      break;
    }
    if (record.indent > indent) {
      const previous = items[items.length - 1];
      if (!previous) {
        break;
      }
      const nested = buildList(records, index, record.indent);
      previous.children = [...(previous.children ?? []), nested.node];
      index = nested.nextRecord;
      continue;
    }

    items.push({
      type: "listItem",
      text: stripMarkdownInline(record.text)
    });
    index += 1;
  }

  return {
    node: {
      type: "list",
      ordered,
      items
    },
    nextRecord: index
  };
}

function parseList(lines: string[], start: number): { node: ListNode; nextIndex: number } | null {
  const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
  if (!first) {
    return null;
  }
  const records: ListRecord[] = [];
  let index = start;

  while (index < lines.length) {
    const match = lines[index].match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
    if (!match) {
      break;
    }
    records.push({
      indent: match[1].replace(/\t/g, "  ").length,
      marker: match[2],
      text: match[3]
    });
    index += 1;
  }

  const built = buildList(records, 0, records[0].indent);
  return {
    node: built.node,
    nextIndex: index
  };
}

function inlineFormulaNodes(text: string): FormulaNode[] {
  const matches = text.match(/\$([^$\n]+)\$/g) ?? [];
  return matches.map((raw) => ({
    type: "formula",
    mode: "inline",
    value: raw.slice(1, -1).trim()
  }));
}

export function markdownToAst(markdown: string) {
  const nodes: DocumentNode[] = [];
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const fence = trimmed.match(/^(```|~~~)\s*([A-Za-z0-9_-]+)?/);
    if (fence) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith(fence[1])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      nodes.push({
        type: "codeBlock",
        language: fence[2],
        code: codeLines.join("\n")
      } satisfies CodeBlockNode);
      index += 1;
      continue;
    }

    if (trimmed === "$$" || (trimmed.startsWith("$$") && !trimmed.endsWith("$$"))) {
      const formulaLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().endsWith("$$")) {
        formulaLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length && lines[index].trim() !== "$$") {
        formulaLines.push(lines[index].trim().replace(/\$\$$/, ""));
      }
      nodes.push({
        type: "formula",
        mode: "block",
        value: formulaLines.join("\n").trim()
      });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4) {
      nodes.push({
        type: "formula",
        mode: "block",
        value: trimmed.slice(2, -2).trim()
      });
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      nodes.push({
        type: "heading",
        depth: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        text: stripMarkdownInline(heading[2])
      });
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      nodes.push(table.node);
      index = table.nextIndex;
      continue;
    }

    const list = parseList(lines, index);
    if (list) {
      nodes.push(list.node);
      index = list.nextIndex;
      continue;
    }

    if (trimmed.startsWith(">")) {
      nodes.push({
        type: "quote",
        text: stripMarkdownInline(trimmed.replace(/^>\s?/, ""))
      });
      index += 1;
      continue;
    }

    nodes.push({
      type: "paragraph",
      text: trimmed
    });
    nodes.push(...inlineFormulaNodes(trimmed));
    index += 1;
  }

  return createWorderDocument(nodes);
}
