# Worder

Worder 是一个面向大语言模型内容整理的本地 Web 工具。它不是简单的“文本转 Word / PDF”，而是把从 ChatGPT、Gemini、Claude、DeepSeek 等模型复制来的长篇内容进行清洗、结构化整理、正确渲染，并导出为正式文档。

> 当前版本：本地 Web MVP。桌面 `.exe` / `.dmg` 安装包尚未发布，后续优先预留 Tauri 接入。

## 核心卖点

- 清洗大模型复制文本中的多余空行、异常空格、错乱缩进和无意义分隔符
- 保护代码块、Markdown 表格、LaTeX 行内公式与块级公式
- 引入 Worder Document AST，让清洗、预览、导出和 ppter 子功能不再只依赖 Markdown 字符串
- 实时可视化预览 Markdown、表格、代码高亮和 KaTeX 公式
- 支持复制为纯文本、Markdown、富文本
- 支持导出 Word `.docx`、PDF `.pdf`、ppter PPTX `.pptx`

## 截图占位

后续发布正式版本时可在这里放置工作台截图：

```text
docs/images/worder-workspace.png
```

## 可视化界面

Worder 当前界面是一个本地可视化工作台，包含：

- 顶部流程条：展示“粘贴输入 -> 清洗/智能整理 -> 实时预览 -> 多格式导出”
- 文档统计卡片：显示标题、列表项、表格、代码块、公式和 ppter slides 数量
- 原始输入区：用于粘贴大模型输出，支持一键载入示例和清空
- 实时预览区：渲染整理后的 Markdown、表格、代码块和 KaTeX 公式
- 文档画像：用进度条展示结构化程度和可展示内容比例
- 导出中心：导出 Word、PDF 或通过 ppter 导出 PPTX
- ppter slide 结构：实时展示整理后内容会被拆成哪些演示页

## 功能列表

- 粘贴 Markdown、普通文本、表格、代码块、LaTeX 公式和多轮对话
- 清理多余空行、异常空格、错乱标题间距、列表缩进和无意义分隔符
- 保护代码块内部缩进，避免破坏代码
- 保护 `$...$` 与 `$$...$$` 公式，避免乱码
- 实时预览 Markdown、GFM 表格、代码高亮和 KaTeX 公式
- 复制为纯文本、Markdown 或富文本
- 导出 `.docx`
- 导出 `.pdf`
- 子功能 `ppter`：将整理后的内容转换为 slide 结构，并导出 `.pptx`

## 当前本地服务器

本机当前开发服务器运行在：

```text
http://127.0.0.1:3001
```

浏览器打开这个地址即可使用 Worder。使用流程：

1. 把 ChatGPT、Gemini、Claude、DeepSeek 等模型输出粘贴到左侧“原始输入”。
2. 在右上角选择“清洗”或“智能整理”。
3. 在中间查看实时预览，确认标题、表格、代码块和公式正常。
4. 点击“纯文本 / Markdown / 富文本”复制内容。
5. 点击“导出 Word / 导出 PDF / ppter 导出 PPTX”下载文件。

如果服务器停止了，可以重新启动：

```bash
cd /Users/song/Documents/ppter/worder
npm run dev -- --hostname 127.0.0.1 --port 3001
```

停止服务器：回到运行 `npm run dev` 的终端，按 `Ctrl + C`。

默认 Next.js 端口是 `3000`。当前使用 `3001` 是为了避免和本机其它项目冲突。

## 下载与运行方式

当前 Worder v0.1.0 是本地 Web MVP，已经可以在 Windows 和 macOS 上通过本地服务器运行。桌面 `.exe` / `.dmg` 安装包还没有正式发布；在桌面安装包完成前，请使用下面方式运行。

源码下载：

```text
https://github.com/songL677/Worder/archive/refs/heads/main.zip
```

### Windows

1. 安装 Node.js LTS。
2. 下载并解压源码。
3. 在 PowerShell 中进入项目目录：

```powershell
cd Worder-main
npm install
npm run dev
```

4. 浏览器打开：

```text
http://localhost:3000
```

如果 3000 端口被占用，可以指定 3001：

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3001
```

### macOS

1. 安装 Node.js LTS，或使用 Homebrew：

```bash
brew install node
```

2. 下载并解压源码。
3. 在终端进入项目目录：

```bash
cd Worder-main
npm install
npm run dev
```

4. 浏览器打开：

```text
http://localhost:3000
```

如果 3000 端口被占用，可以指定 3001：

```bash
npm run dev -- --hostname 127.0.0.1 --port 3001
```

## 技术栈与关键依赖

所有依赖都固定为明确版本，避免 `latest` 导致安装和构建不可复现。

| 依赖 | 用途 |
| --- | --- |
| Next.js `16.2.9` | App Router、本地 Web 工作台、未来 Vercel 部署 |
| React `19.2.7` | 交互式 UI |
| TypeScript `6.0.3` | 类型约束和 AST 建模 |
| Tailwind CSS `3.4.19` | 界面样式 |
| react-markdown `10.1.0` | Markdown 预览渲染 |
| remark-gfm `4.0.1` | GFM 表格、任务列表等 Markdown 扩展 |
| remark-math `6.0.0` | Markdown 数学公式解析 |
| rehype-katex `7.0.1` / KaTeX `0.17.0` | 数学公式渲染 |
| rehype-highlight `7.0.2` / highlight.js `11.11.1` | 代码块高亮 |
| docx `9.7.1` | Word `.docx` 导出 |
| html2pdf.js `0.14.0` | MVP PDF 导出 |
| pptxgenjs `4.0.1` | ppter PPTX 导出 |
| Vitest `4.1.8` | 核心清洗与 ppter 测试 |

## 架构概览

```text
Raw input
  -> protect special blocks
  -> clean whitespace
  -> normalize markdown
  -> parse to Worder Document AST
  -> render markdown / plain text / preview / export
```

目录结构：

```text
src/
├── app/
├── components/
├── core/
│   ├── ast/
│   ├── cleaner/
│   ├── parser/
│   ├── pipeline/
│   └── renderer/
├── features/
│   └── ppter/
├── lib/
│   ├── clipboard/
│   └── exporters/
│       ├── pdf/
│       ├── ppt/
│       └── word/
└── types/
```

## 本地开发

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

## 测试

```bash
npm test
```

测试覆盖：

- 多余空行清理
- 行首行尾空格清理
- 代码块内部缩进保留
- 多个代码块同时存在
- 行内公式 `$E = mc^2$`
- 块级公式 `$$E = mc^2$$`
- Markdown 表格
- 中文英文混排
- 标题前后空行
- 列表缩进
- 用户 / AI 多轮对话
- 超长文本 warning
- ppter slide 拆分逻辑

## 构建

```bash
npm run build
```

## 导出说明

### Word

点击“导出 Word”会生成 `worder-document.docx`。当前 MVP 会尽量保留标题、段落、列表、表格和代码块。

公式 fallback 策略：

1. 优先保留 LaTeX source text，确保不乱码、不丢失。
2. 后续再尝试 LaTeX -> MathML / Office Math。
3. 更复杂公式可考虑渲染为图片嵌入。

### PDF

点击“导出 PDF”会把右侧预览区域导出为 `worder-document.pdf`。当前 MVP 使用 `html2pdf.js`。

未来推荐方案：

```text
HTML Preview -> Playwright / Chromium -> PDF
```

原因：

- 更稳定的分页
- 更好的中文字体支持
- 更好的公式渲染
- 更好的代码块和表格导出效果

### ppter

ppter 是 Worder 的子功能，不是主功能。它读取 Worder 清洗后的内容，自动识别标题和要点，生成 slide 结构，并支持导出 `worder-slides.pptx`。

当前 ppter 已拆分：

- `markdownToSlides.ts`：Markdown -> slides
- `astToSlides.ts`：Worder Document AST -> slides
- `pptxExporter.ts`：slides -> PPTX

## 当前限制

- PDF 当前使用 `html2pdf.js`，复杂分页后续需要 Playwright / Chromium 优化。
- Word 公式目前优先保证不乱码、不丢失，Office Math 后续增强。
- 桌面安装包尚未发布。
- ppter 当前是基础 slide 拆分，后续会增强智能大纲和主题模板。
- 云端部署路径已预留，但当前默认仍是本地运行。

## 桌面版路线

见 [docs/desktop-roadmap.md](docs/desktop-roadmap.md)。

目标结构：

```text
apps/desktop
  -> Tauri shell
  -> reuse current Next.js frontend
  -> local filesystem capabilities
  -> package exe / dmg / AppImage
```

## 云端部署路线

Worder 当前可作为普通 Next.js 应用部署，后续可补充：

- Vercel 部署
- Dockerfile
- 自建 Node.js 服务
- 服务端 Playwright PDF 导出

## 贡献方式

1. Fork 仓库。
2. 创建功能分支。
3. 运行 `npm test` 和 `npm run build`。
4. 提交 Pull Request，并说明修改动机和验证结果。

## License

当前仓库尚未正式选择开源 License。发布公共版本前建议补充 MIT 或 Apache-2.0 License。
