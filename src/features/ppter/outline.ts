import type { Slide } from "@/types/document";
import { stripMarkdownInline } from "@/lib/exporters/markdownTokens";

function cleanBullet(line: string): string {
  return stripMarkdownInline(line.replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+[.)]\s+/, ""));
}

export function markdownToSlides(markdown: string): Slide[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const slides: Slide[] = [];
  let current: Slide | null = null;
  let inCode = false;
  let inMath = false;
  let mathBuffer: string[] = [];

  const flush = () => {
    if (current && (current.title.trim() || current.bullets.length > 0)) {
      slides.push({
        title: current.title || `Slide ${slides.length + 1}`,
        bullets: current.bullets.slice(0, 6)
      });
    }
  };

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      continue;
    }

    if (line.trim().startsWith("$$")) {
      if (inMath) {
        if (!current) {
          current = { title: "公式", bullets: [] };
        }
        const formula = mathBuffer.join(" ").trim();
        if (formula) {
          current.bullets.push(formula);
        }
        mathBuffer = [];
        inMath = false;
      } else {
        inMath = true;
        mathBuffer = [];
      }
      continue;
    }

    if (inMath) {
      if (line.trim()) {
        mathBuffer.push(line.trim());
      }
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flush();
      current = { title: stripMarkdownInline(heading[2]), bullets: [] };
      continue;
    }

    const listItem = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (listItem) {
      if (!current) {
        current = { title: "内容要点", bullets: [] };
      }
      current.bullets.push(cleanBullet(listItem[0]));
      continue;
    }

    if (line.trim() && current && current.bullets.length < 4) {
      current.bullets.push(stripMarkdownInline(line.trim()));
    }
  }

  flush();

  if (slides.length === 0 && markdown.trim()) {
    return [
      {
        title: "内容摘要",
        bullets: markdown
          .split(/\n+/)
          .map((line) => stripMarkdownInline(line))
          .filter(Boolean)
          .slice(0, 6)
      }
    ];
  }

  return slides;
}
