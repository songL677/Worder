import type { WorderDocument } from "@/core/ast/types";

export interface Exporter<TOptions = unknown> {
  id: string;
  label: string;
  extension: string;
  export(document: WorderDocument, options?: TOptions): Promise<Blob | void>;
}

export interface DomPdfExportOptions {
  element: HTMLElement;
  fileName?: string;
}
