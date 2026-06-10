import type { WorderDocument } from "@/core/ast/types";

export type CleanMode = "clean" | "structure";

export type ProtectedSegmentKind = "text" | "code" | "math";

export interface ProtectedSegment {
  kind: ProtectedSegmentKind;
  content: string;
}

export interface CleanOptions {
  mode: CleanMode;
  collapseBlankLines?: boolean;
}

export interface CleanResult {
  markdown: string;
  plainText: string;
  document: WorderDocument;
  warnings: string[];
}

export type { Slide } from "@/features/ppter/types";

export type {
  CodeBlockNode,
  DocumentNode,
  FormulaNode,
  HeadingNode,
  ListItemNode,
  ListNode,
  ParagraphNode,
  QuoteNode,
  TableNode,
  WorderDocument
} from "@/core/ast/types";
