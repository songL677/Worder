import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Worder",
  description: "Clean, structure, preview, and export LLM-generated content."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
