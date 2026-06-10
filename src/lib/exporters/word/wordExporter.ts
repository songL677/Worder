import type { Exporter } from "@/lib/exporters/types";
import { exportDocumentToDocxBlob } from "@/lib/exporters/docxExporter";

export const wordExporter: Exporter = {
  id: "word",
  label: "Word",
  extension: "docx",
  export: exportDocumentToDocxBlob
};
