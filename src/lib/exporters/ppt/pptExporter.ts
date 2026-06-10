import type { Exporter } from "@/lib/exporters/types";
import { astToSlides } from "@/features/ppter/astToSlides";
import { exportSlidesToPptx } from "@/features/ppter/pptxExporter";

export const pptExporter: Exporter = {
  id: "pptx",
  label: "PPTX",
  extension: "pptx",
  async export(document) {
    await exportSlidesToPptx(astToSlides(document));
  }
};
