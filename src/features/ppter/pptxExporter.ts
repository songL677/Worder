import pptxgen from "pptxgenjs";
import type { Slide } from "@/types/document";

export async function exportSlidesToPptx(slides: Slide[], fileName = "worder-slides.pptx") {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Worder";
  pptx.subject = "Generated from cleaned Worder content";
  pptx.title = "Worder Slides";
  pptx.company = "Worder";
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei"
  };

  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FBFBF8" };
    slide.addText(slideData.title, {
      x: 0.55,
      y: 0.42,
      w: 12.2,
      h: 0.55,
      fontFace: "Microsoft YaHei",
      fontSize: 28,
      bold: true,
      color: "1F2933",
      breakLine: false
    });
    slide.addShape(pptx.ShapeType.line, {
      x: 0.55,
      y: 1.12,
      w: 12.2,
      h: 0,
      line: { color: "D8DDD4", width: 1.2 }
    });
    slide.addText(
      slideData.bullets.map((bullet) => ({ text: bullet, options: { bullet: { indent: 18 } } })),
      {
        x: 0.82,
        y: 1.45,
        w: 11.75,
        h: 4.8,
        fontFace: "Microsoft YaHei",
        fontSize: 18,
        color: "24313D",
        fit: "shrink",
        breakLine: false,
        paraSpaceAfter: 10
      }
    );
    slide.addText(`${index + 1} / ${slides.length}`, {
      x: 11.75,
      y: 6.82,
      w: 1,
      h: 0.25,
      fontSize: 9,
      color: "6B7280",
      align: "right"
    });
  });

  await pptx.writeFile({ fileName });
}
