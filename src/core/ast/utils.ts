import type { DocumentNode, WorderDocument } from "./types";

export const WORDER_AST_VERSION = "0.1";

export function createWorderDocument(nodes: DocumentNode[], source = "paste"): WorderDocument {
  const firstHeading = nodes.find((node) => node.type === "heading");
  return {
    version: WORDER_AST_VERSION,
    nodes,
    metadata: {
      title: firstHeading?.type === "heading" ? firstHeading.text : undefined,
      source,
      createdAt: new Date().toISOString()
    }
  };
}

export function countNodes(document: WorderDocument, type: DocumentNode["type"]): number {
  return document.nodes.filter((node) => node.type === type).length;
}
