import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";
import { saveAs } from "file-saver";
import type { WorderDocument } from "@/core/ast/types";
import { markdownToAst } from "@/core/parser/markdownToAst";
import { astToMarkdown } from "@/core/renderer/astToMarkdown";
import { lexMarkdown, stripMarkdownInline } from "./markdownTokens";

const headingMap = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6
];

function paragraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 180, line: 320 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })]
  });
}

function codeParagraph(text: string): Paragraph {
  return new Paragraph({
    shading: { fill: "F3F4F6" },
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, font: "Consolas", size: 18 })]
  });
}

function listParagraph(text: string, ordered: boolean, level: number): Paragraph {
  return new Paragraph({
    bullet: ordered ? undefined : { level: Math.min(level, 2) },
    numbering: ordered
      ? { reference: "ordered-list", level: Math.min(level, 2) }
      : undefined,
    spacing: { after: 90 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })]
  });
}

function tableFromRows(rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                margins: { top: 90, bottom: 90, left: 120, right: 120 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "D0D7DE" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "D0D7DE" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "D0D7DE" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "D0D7DE" }
                },
                children: [paragraph(stripMarkdownInline(cell))]
              })
          )
        })
    )
  });
}

function addListItems(children: (Paragraph | Table)[], items: any[], ordered: boolean, level = 0) {
  for (const item of items) {
    children.push(listParagraph(stripMarkdownInline(item.text ?? ""), ordered, level));
    if (item.tokens) {
      const nested = item.tokens.find((token: any) => token.type === "list");
      if (nested?.items) {
        addListItems(children, nested.items, Boolean(nested.ordered), level + 1);
      }
    }
  }
}

function markdownToDocxDocument(markdown: string): Document {
  const children: (Paragraph | Table)[] = [];
  const tokens = lexMarkdown(markdown);

  for (const token of tokens as any[]) {
    if (token.type === "heading") {
      children.push(
        new Paragraph({
          heading: headingMap[Math.min(token.depth, 6)],
          spacing: { before: 260, after: 140 },
          children: [new TextRun({ text: stripMarkdownInline(token.text), font: "Microsoft YaHei" })]
        })
      );
    } else if (token.type === "paragraph") {
      // Formula fallback policy for Word export:
      // 1. Preserve LaTeX source text without mangling.
      // 2. Future: convert LaTeX -> MathML / Office Math where reliable.
      // 3. Future: render formula images for complex equations.
      // The current MVP prioritizes "not garbled, not lost" over imperfect Office Math conversion.
      children.push(paragraph(stripMarkdownInline(token.text)));
    } else if (token.type === "space") {
      children.push(new Paragraph({ text: "" }));
    } else if (token.type === "code") {
      const lines = String(token.text ?? "").split("\n");
      lines.forEach((line) => children.push(codeParagraph(line || " ")));
    } else if (token.type === "list") {
      addListItems(children, token.items ?? [], Boolean(token.ordered));
    } else if (token.type === "table") {
      const rows = [
        (token.header ?? []).map((cell: any) => stripMarkdownInline(cell.text ?? "")),
        ...(token.rows ?? []).map((row: any[]) => row.map((cell) => stripMarkdownInline(cell.text ?? "")))
      ];
      children.push(tableFromRows(rows));
    } else if (token.raw) {
      children.push(paragraph(stripMarkdownInline(token.raw)));
    }
  }

  return new Document({
    numbering: {
      config: [
        {
          reference: "ordered-list",
          levels: [0, 1, 2].map((level) => ({
            level,
            format: "decimal",
            text: `%${level + 1}.`,
            alignment: AlignmentType.LEFT
          }))
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, right: 900, bottom: 900, left: 900 }
          }
        },
        children
      }
    ]
  });
}

export async function createDocxBlobFromMarkdown(markdown: string): Promise<Blob> {
  return Packer.toBlob(markdownToDocxDocument(markdown));
}

export async function exportDocumentToDocxBlob(document: WorderDocument): Promise<Blob> {
  return createDocxBlobFromMarkdown(astToMarkdown(document));
}

export async function exportMarkdownToDocx(markdown: string, fileName = "worder-document.docx") {
  const blob = await createDocxBlobFromMarkdown(markdown);
  saveAs(blob, fileName);
}

export async function exportDocumentToDocx(document: WorderDocument, fileName = "worder-document.docx") {
  const blob = await exportDocumentToDocxBlob(document);
  saveAs(blob, fileName);
}

export async function exportRawMarkdownToDocx(markdown: string, fileName = "worder-document.docx") {
  return exportDocumentToDocx(markdownToAst(markdown), fileName);
}
