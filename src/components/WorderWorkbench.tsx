"use client";

import { useMemo, useRef, useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  FileType2,
  LayoutPanelTop,
  Sparkles,
  Wand2
} from "lucide-react";
import { cleanMarkdown } from "@/lib/cleaning/cleanMarkdown";
import { exportMarkdownToDocx } from "@/lib/exporters/docxExporter";
import { exportElementToPdf } from "@/lib/exporters/pdfExporter";
import { markdownToSlides } from "@/features/ppter/outline";
import { exportSlidesToPptx } from "@/features/ppter/pptxExporter";
import type { CleanMode } from "@/types/document";
import { MarkdownPreview } from "./MarkdownPreview";

const sampleInput = `# 机器学习复习提纲

用户：帮我总结一下监督学习。

AI：监督学习是从带标签数据中学习映射关系的方法。


## 关键公式

$$
L(\\theta)=\\frac{1}{n}\\sum_{i=1}^{n}(y_i-f_\\theta(x_i))^2
$$

## 对比表

| 方法 | 适用场景 | 风险 |
| --- | --- | --- |
| 线性回归 | 连续值预测 | 欠拟合 |
| 决策树 | 可解释分类 | 过拟合 |

代码示例：

\`\`\`python
def predict(x, w, b):
    return x * w + b
\`\`\`
`;

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function WorderWorkbench() {
  const [rawText, setRawText] = useState(sampleInput);
  const [mode, setMode] = useState<CleanMode>("structure");
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const cleaned = useMemo(() => cleanMarkdown(rawText, { mode }), [rawText, mode]);
  const slides = useMemo(() => markdownToSlides(cleaned.markdown), [cleaned.markdown]);

  const markCopied = (kind: string) => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };

  const handleCopyMarkdown = async () => {
    await copyToClipboard(cleaned.markdown);
    markCopied("markdown");
  };

  const handleCopyPlain = async () => {
    await copyToClipboard(cleaned.plainText);
    markCopied("plain");
  };

  const handleCopyRich = async () => {
    if (!previewRef.current || !navigator.clipboard.write) {
      await handleCopyMarkdown();
      return;
    }
    const html = previewRef.current.innerHTML;
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([cleaned.plainText], { type: "text/plain" })
    });
    await navigator.clipboard.write([item]);
    markCopied("rich");
  };

  const handleDocx = async () => {
    setExporting("docx");
    try {
      await exportMarkdownToDocx(cleaned.markdown, "worder-document.docx");
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    if (!previewRef.current) {
      return;
    }
    setExporting("pdf");
    try {
      await exportElementToPdf(previewRef.current, "worder-document.pdf");
    } finally {
      setExporting(null);
    }
  };

  const handlePptx = async () => {
    setExporting("pptx");
    try {
      await exportSlidesToPptx(slides, "worder-slides.pptx");
    } finally {
      setExporting(null);
    }
  };

  return (
    <main className="min-h-screen px-4 py-5 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1580px] flex-col gap-4">
        <header className="no-print flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-paper">
                <FileText size={21} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">Worder</h1>
                <p className="text-sm text-slate-600">清洗、结构化整理、预览并导出大模型长文本。</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-line bg-white p-1 shadow-sm">
              <button
                className={`flex h-9 items-center gap-2 rounded px-3 text-sm ${mode === "clean" ? "bg-sage text-white" : "text-slate-700"}`}
                onClick={() => setMode("clean")}
                type="button"
              >
                <Wand2 size={16} />
                清洗
              </button>
              <button
                className={`flex h-9 items-center gap-2 rounded px-3 text-sm ${mode === "structure" ? "bg-sage text-white" : "text-slate-700"}`}
                onClick={() => setMode("structure")}
                type="button"
              >
                <Sparkles size={16} />
                智能整理
              </button>
            </div>
          </div>
        </header>

        <section className="grid min-h-[calc(100vh-118px)] gap-4 lg:grid-cols-[minmax(360px,0.9fr)_minmax(420px,1.1fr)_310px]">
          <div className="no-print flex min-h-[620px] flex-col rounded-md border border-line bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold">原始输入</h2>
              <span className="text-xs text-slate-500">{rawText.length.toLocaleString()} 字符</span>
            </div>
            <textarea
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none border-0 bg-white p-4 font-mono text-sm leading-6 text-slate-800 outline-none"
              placeholder="粘贴 ChatGPT、Gemini、Claude、DeepSeek 等大模型输出..."
            />
          </div>

          <div className="flex min-h-[620px] flex-col rounded-md border border-line bg-white shadow-sm">
            <div className="no-print flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">实时预览</h2>
                <p className="text-xs text-slate-500">{cleaned.markdown.length.toLocaleString()} 字符，{slides.length} 页 slide 建议</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={handleCopyPlain} type="button">
                  {copied === "plain" ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                  纯文本
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={handleCopyMarkdown} type="button">
                  {copied === "markdown" ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                  Markdown
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm text-slate-700 hover:bg-slate-50" onClick={handleCopyRich} type="button">
                  {copied === "rich" ? <ClipboardCheck size={16} /> : <LayoutPanelTop size={16} />}
                  富文本
                </button>
              </div>
            </div>
            <article ref={previewRef} className="min-h-0 flex-1 overflow-auto bg-paper px-6 py-5">
              <MarkdownPreview markdown={cleaned.markdown} />
            </article>
          </div>

          <aside className="no-print flex min-h-[620px] flex-col gap-4">
            <section className="rounded-md border border-line bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">导出</h2>
              <div className="grid gap-2">
                <button className="flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm text-white hover:bg-slate-800 disabled:opacity-60" onClick={handleDocx} disabled={Boolean(exporting)} type="button">
                  <FileType2 size={16} />
                  {exporting === "docx" ? "生成中..." : "导出 Word"}
                </button>
                <button className="flex h-10 items-center justify-center gap-2 rounded-md bg-clay px-3 text-sm text-white hover:bg-[#8d4e3a] disabled:opacity-60" onClick={handlePdf} disabled={Boolean(exporting)} type="button">
                  <Download size={16} />
                  {exporting === "pdf" ? "生成中..." : "导出 PDF"}
                </button>
                <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-line px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60" onClick={handlePptx} disabled={Boolean(exporting) || slides.length === 0} type="button">
                  <LayoutPanelTop size={16} />
                  {exporting === "pptx" ? "生成中..." : "ppter 导出 PPTX"}
                </button>
              </div>
              {cleaned.warnings.length > 0 ? (
                <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {cleaned.warnings.join(" ")}
                </div>
              ) : null}
            </section>

            <section className="min-h-0 flex-1 rounded-md border border-line bg-white shadow-sm">
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-sm font-semibold">ppter slide 结构</h2>
              </div>
              <div className="max-h-[480px] space-y-3 overflow-auto p-4">
                {slides.map((slide, index) => (
                  <div key={`${slide.title}-${index}`} className="rounded-md border border-line bg-paper p-3">
                    <div className="mb-2 flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sage text-xs text-white">{index + 1}</span>
                      <h3 className="text-sm font-semibold leading-5">{slide.title}</h3>
                    </div>
                    <ul className="space-y-1 pl-7 text-xs leading-5 text-slate-600">
                      {slide.bullets.map((bullet, bulletIndex) => (
                        <li key={`${bullet}-${bulletIndex}`} className="list-disc">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
