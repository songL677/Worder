import { describe, expect, it } from "vitest";
import { cleanMarkdown } from "@/lib/cleaning/cleanMarkdown";

describe("cleanMarkdown", () => {
  it("removes redundant blank lines", () => {
    const input = "第一段\n\n\n\n第二段\n\n\n第三段";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toBe("第一段\n\n第二段\n\n第三段");
  });

  it("preserves code block indentation", () => {
    const input = ["说明：", "```python", "def run():", "    return 42", "```"].join("\n");
    const result = cleanMarkdown(input, { mode: "structure" });
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

  it("normalizes markdown tables", () => {
    const input = "| 名称  |  说明 |\n| --- | --- |\n|  Worder |  文档整理 |";
    const result = cleanMarkdown(input, { mode: "clean" });
    expect(result.markdown).toContain("| 名称 | 说明 |");
    expect(result.markdown).toContain("| --- | --- |");
    expect(result.markdown).toContain("| Worder | 文档整理 |");
    expect(result.markdown).not.toContain("||");
  });

  it("structures chat turns as QA-like markdown", () => {
    const input = "用户：解释梯度下降\nAI：它是一种迭代优化方法。";
    const result = cleanMarkdown(input, { mode: "structure" });
    expect(result.markdown).toContain("**用户：** 解释梯度下降");
    expect(result.markdown).toContain("**AI：** 它是一种迭代优化方法。");
  });
});
