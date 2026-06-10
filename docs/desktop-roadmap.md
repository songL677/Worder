# Worder Desktop Roadmap

Worder 当前是本地 Web MVP。桌面版优先预留 Tauri 接入能力，但暂时不强行重写为桌面项目。

## 目标

```text
apps/desktop
  -> Tauri shell
  -> 复用当前 Next.js 前端
  -> 调用本地文件系统能力
  -> 打包 Windows .exe
  -> 打包 macOS .dmg
  -> 打包 Linux AppImage / deb
```

## 为什么优先 Tauri

- 包体比 Electron 更轻
- Rust 后端适合接入本地文件系统能力
- 可以复用当前 React / Next.js 前端
- 更适合本地文档处理工具

## 建议阶段

### Phase 1：保持 Web MVP 稳定

- 固定依赖版本
- 保持 `npm install` / `npm test` / `npm run build` 稳定
- 完成 Document AST、导出接口和 ppter 子功能边界

### Phase 2：抽象平台能力

新增接口层，例如：

```text
src/lib/platform/
  fs.ts
  download.ts
  clipboard.ts
```

Web 版本继续使用浏览器 API。桌面版本通过 Tauri command 调用本地能力。

### Phase 3：新增桌面壳

建议目录：

```text
apps/
└── desktop/
    ├── src-tauri/
    └── package.json
```

Tauri 加载方式可选：

1. 开发期加载 `http://localhost:3000`
2. 发布期加载 Next.js static export 产物

### Phase 4：桌面能力

- 打开本地文件
- 保存 Word / PDF / PPTX 到用户指定目录
- 本地历史记录
- 本地配置
- 后续可选自动更新

### Phase 5：打包发布

目标产物：

- Windows `.exe`
- macOS `.dmg`
- Linux `.AppImage` / `.deb`

## 当前不做的事

- 不在 MVP 中强行加入 Tauri
- 不改变现有 Web 使用方式
- 不把导出逻辑绑定到某一个桌面运行时
- 不引入需要登录或服务器的能力

## 接入前检查清单

- `npm install` 通过
- `npm test` 通过
- `npm run build` 通过
- 导出接口不直接依赖 React 组件
- PDF 导出有 DOM adapter 和未来服务端 adapter 计划
- ppter 只接收整理后的 Markdown / Document AST，不直接处理原始输入
