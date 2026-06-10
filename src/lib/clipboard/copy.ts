export async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("当前浏览器不支持剪贴板写入，请手动选择内容复制。");
  }
  await navigator.clipboard.writeText(text);
}

export async function copyRichTextToClipboard(html: string, plainText: string) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("当前浏览器不支持富文本复制，请改用 Markdown 复制。");
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" })
    })
  ]);
}
