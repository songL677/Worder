import type { DomPdfExportOptions, Exporter } from "@/lib/exporters/types";

export async function exportElementToPdf(element: HTMLElement, fileName = "worder-document.pdf") {
  const html2pdf = (await import("html2pdf.js")).default;

  // MVP strategy:
  // HTML Preview -> html2pdf.js -> PDF.
  //
  // Future recommended strategy:
  // HTML Preview -> Playwright / Chromium -> PDF.
  //
  // Playwright will give more stable pagination, better CJK font handling,
  // and more predictable formula/code/table rendering for production exports.
  await html2pdf()
    .set({
      margin: [12, 12, 14, 12],
      filename: fileName,
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: "#ffffff"
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ["pre", "table", ".katex-display"] }
    })
    .from(element)
    .save();
}

export const pdfExporter: Exporter<DomPdfExportOptions> = {
  id: "pdf",
  label: "PDF",
  extension: "pdf",
  async export(_document, options) {
    if (!options?.element) {
      throw new Error("PDF 导出需要传入预览 DOM。");
    }
    await exportElementToPdf(options.element, options.fileName);
  }
};
