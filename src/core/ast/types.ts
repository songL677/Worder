export type DocumentNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ListItemNode
  | CodeBlockNode
  | TableNode
  | FormulaNode
  | QuoteNode;

export interface BaseNode {
  id?: string;
  type: DocumentNode["type"];
}

export interface HeadingNode {
  id?: string;
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphNode {
  id?: string;
  type: "paragraph";
  text: string;
}

export interface ListNode {
  id?: string;
  type: "list";
  ordered: boolean;
  items: ListItemNode[];
}

export interface ListItemNode {
  id?: string;
  type: "listItem";
  text: string;
  children?: ListNode[];
}

export interface CodeBlockNode {
  id?: string;
  type: "codeBlock";
  language?: string;
  code: string;
}

export interface TableNode {
  id?: string;
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface FormulaNode {
  id?: string;
  type: "formula";
  mode: "inline" | "block";
  value: string;
}

export interface QuoteNode {
  id?: string;
  type: "quote";
  text: string;
}

export interface WorderDocument {
  version: string;
  nodes: DocumentNode[];
  metadata?: {
    title?: string;
    source?: string;
    createdAt?: string;
  };
}
