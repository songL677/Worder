# Worder

Worder 是一个面向大语言模型内容整理的本地 Web 工具。它不是简单的“文本转 Word / PDF”，核心价值是把从 ChatGPT、Gemini、Claude、DeepSeek 等模型复制来的长篇内容清洗、结构化整理、正确渲染，并导出为正式文档。

## 功能

- 粘贴 Markdown、普通文本、表格、代码块、LaTeX 公式和多轮对话
- 清理多余空行、异常空格、错乱标题间距、列表缩进和无意义分隔符
- 保护代码块内部缩进，避免破坏代码
- 保护 `$...$` 与 `$$...$$` 公式，避免乱码
- 实时预览 Markdown、GFM 表格、代码高亮和 KaTeX 公式
- 复制为纯文本、Markdown 或富文本
- 导出 `.docx`
- 导出 `.pdf`
- 子功能 `ppter`：将整理后的内容转换为 slide 结构，并导出 `.pptx`

## 技术栈

- Next.js + React + TypeScript：适合快速构建本地可运行的交互式文档工具
- Tailwind CSS：保持界面简洁一致
- react-markdown + remark-gfm + remark-math + rehype-katex：渲染 Markdown、表格和公式
- rehype-highlight：代码高亮
- docx：浏览器端生成 Word 文件
- html2pdf.js：基于渲染后的预览区域导出 PDF
- pptxgenjs：实现 ppter 的 PPTX 导出
- Vitest：测试核心清洗逻辑

## 项目结构

```text
worder/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   └── ppter/
│   ├── lib/
│   │   ├── cleaning/
│   │   └── exporters/
│   └── types/
├── tests/
├── package.json
└── README.md
```

## 本地安装

```bash
cd worder
npm install
```

## 运行

```bash
npm run dev
```

打开本地地址后，直接把大模型输出粘贴到左侧输入区即可。

## 测试

```bash
npm test
```

测试重点覆盖：

- 多余空行清理
- 代码块格式保留
- 公式不乱码
- 中英文混排
- Markdown 表格
- 多轮问答整理

## 导出说明

### Word

点击“导出 Word”会生成 `worder-document.docx`。当前 MVP 会尽量保留标题、段落、列表、表格和代码块；公式会以可读文本形式保留，后续可增强为 Office Math。

### PDF

点击“导出 PDF”会把右侧预览区域导出为 `worder-document.pdf`。PDF 基于浏览器渲染结果生成，因此公式、表格和代码块会尽量接近预览效果。

### ppter

ppter 是 Worder 的子功能，不再作为主项目。它读取 Worder 清洗后的 Markdown，自动识别标题和要点，生成 slide 结构，并支持导出 `worder-slides.pptx`。

## 路线图

- 更精细的 Markdown AST 到 Word 样式映射
- Office Math 公式转换
- 更强的表格宽度自适应
- 支持导出模板和主题
- ppter 增加版式主题、封面页和演讲者备注
- 支持本地历史记录
