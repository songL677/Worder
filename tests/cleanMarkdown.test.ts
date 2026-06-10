import { describe, expect, it } from "vitest";
import { cleanMarkdown } from "@/lib/cleaning/cleanMarkdown";
import { processInput } from "@/core/pipeline/processInput";
import { astToSlides } from "@/features/ppter/astToSlides";

describe("cleanMarkdown", () => {
  it("removes redundant blank lines", () => {
    const input = "第一段\n\n\n\n第二段\n\n\n第三段";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toBe("第一段\n\n第二段\n\n第三段");
    expect(result.markdown).not.toMatch(/\n{3,}/);
  });

  it("preserves code block indentation", () => {
    const input = ["说明：", "```python", "def run():", "    return 42", "```"].join("\n");
    const result = cleanMarkdown(input, { mode: "structure" });
    expect(result.markdown).toContain("```python\ndef run():\n    return 42\n```");
  });

  it("preserves multiple code blocks independently", () => {
    const input = [
      "```ts",
      "const a = 1;",
      "```",
      "正文",
      "```python",
      "def run():",
      "    return 42",
      "```"
    ].join("\n");
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toContain("```ts\nconst a = 1;\n```");
    expect(result.markdown).toContain("```python\ndef run():\n    return 42\n```");
  });

  it("keeps math formulas readable", () => {
    const input = "公式如下：\n\n$$\nE = mc^2\n$$\n行内公式 $a^2+b^2=c^2$ 不应乱码。";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toContain("$$\nE = mc^2\n$$");
    expect(result.markdown).toContain("$a^2+b^2=c^2$");
  });

  it("removes abnormal spaces around Chinese punctuation", () => {
    const input = "中文 ， English   text  混排 。";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toBe("中文， English text 混排。");
  });

  it("trims leading and trailing spaces on normal lines", () => {
    const result = cleanMarkdown("   第一段   \n   第二段   ", { mode: "clean" });
    expect(result.markdown).toBe("第一段\n\n第二段");
  });

  it("normalizes markdown tables", () => {
    const input = "| 名称  |  说明 |\n| --- | --- |\n|  Worder |  文档整理 |";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toContain("| 名称 | 说明 |");
    expect(result.markdown).toContain("| --- | --- |");
    expect(result.markdown).toContain("| Worder | 文档整理 |");
    expect(result.markdown).not.toContain("||");
  });

  it("keeps heading spacing readable", () => {
    const result = cleanMarkdown("正文\n#  标题  \n内容", { mode: "clean" });
    expect(result.markdown).toBe("正文\n\n# 标题\n\n内容");
  });

  it("normalizes list indentation without flattening item text", () => {
    const result = cleanMarkdown("  -   一级\n    -   二级", { mode: "clean" });
    expect(result.markdown).toContain("- 一级");
    expect(result.markdown).toContain("  - 二级");
  });

  it("structures chat turns as QA-like markdown", () => {
    const input = "用户：解释梯度下降\nAI：它是一种迭代优化方法。";
    const result = cleanMarkdown(input, { mode: "structure" });
    expect(result.markdown).toContain("**用户：** 解释梯度下降");
    expect(result.markdown).toContain("**AI：** 它是一种迭代优化方法。");
  });

  it("creates a Document AST with key node types", () => {
    const result = processInput("# 标题\n\n正文 $E = mc^2$\n\n> 引用", { mode: "clean" });
    expect(result.document.version).toBe("0.1");
    expect(result.document.nodes.some((node) => node.type === "heading")).toBe(true);
    expect(result.document.nodes.some((node) => node.type === "paragraph")).toBe(true);
    expect(result.document.nodes.some((node) => node.type === "formula" && node.mode === "inline")).toBe(true);
    expect(result.document.nodes.some((node) => node.type === "quote")).toBe(true);
  });

  it("warns for very long text", () => {
    const result = processInput("a".repeat(120_001), { mode: "clean" });
    expect(result.warnings.join("")).toContain("文本较长");
  });

  it("splits ppter slides from the cleaned AST", () => {
    const result = processInput("# 第一页\n\n- 要点 A\n- 要点 B\n\n## 第二页\n\n正文", { mode: "clean" });
    const slides = astToSlides(result.document);
    expect(slides).toHaveLength(2);
    expect(slides[0].title).toBe("第一页");
    expect(slides[0].bullets).toContain("要点 A");
  });
});
