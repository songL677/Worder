export async function exportElementToPdf(element: HTMLElement, fileName = "worder-document.pdf") {
  const html2pdf = (await import("html2pdf.js")).default;

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
