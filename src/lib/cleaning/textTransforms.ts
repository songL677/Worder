const CJK = "\u3400-\u9fff";

function normalizeInlineSpaces(line: string): string {
  let next = line.replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, "");
  next = next.replace(/\t/g, "  ");
  next = next.replace(/[ \u00a0]{2,}/g, " ");
  next = next.replace(new RegExp(`([${CJK}])\\s+([，。！？；：、）】》」』])`, "g"), "$1$2");
  next = next.replace(new RegExp(`([（【《「『])\\s+([${CJK}A-Za-z0-9$])`, "g"), "$1$2");
  next = next.replace(/\s+([,.;:!?])/g, "$1");
  next = next.replace(/([([{])\s+/g, "$1");
  next = next.replace(/\s+([)\]}])/g, "$1");
  return next.trim();
}

function isMeaninglessSeparator(line: string): boolean {
  const trimmed = line.trim();
  return /^(?:[-_*=\s]){8,}$/.test(trimmed);
}

function normalizeHeading(line: string): string | null {
  const match = line.match(/^(#{1,6})\s*(.+?)\s*#*$/);
  if (!match) {
    return null;
  }
  return `${match[1]} ${normalizeInlineSpaces(match[2])}`;
}

function normalizeList(line: string): string | null {
  const unordered = line.match(/^(\s*)[-*+]\s+(.+)$/);
  if (unordered) {
    const level = Math.floor(unordered[1].replace(/\t/g, "  ").length / 2);
    return `${"  ".repeat(level)}- ${normalizeInlineSpaces(unordered[2])}`;
  }

  const ordered = line.match(/^(\s*)(\d+)[.)]\s+(.+)$/);
  if (ordered) {
    const level = Math.floor(ordered[1].replace(/\t/g, "  ").length / 2);
    return `${"  ".repeat(level)}${ordered[2]}. ${normalizeInlineSpaces(ordered[3])}`;
  }

  return null;
}

function normalizeTable(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) {
    return null;
  }
  const cells = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  if (cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
    return `| ${cells.join(" | ")} |`;
  }
  if (cells.length >= 2) {
    return `| ${cells.map((cell) => normalizeInlineSpaces(cell)).join(" | ")} |`;
  }
  return null;
}

function normalizeSpeakerLine(line: string): string | null {
  const match = line.match(/^(用户|User|Human|我|AI|Assistant|ChatGPT|Gemini|Claude|DeepSeek)\s*[:：]\s*(.+)$/i);
  if (!match) {
    return null;
  }
  const role = /^(用户|user|human|我)$/i.test(match[1]) ? "用户" : "AI";
  return `**${role}：** ${normalizeInlineSpaces(match[2])}`;
}

export function cleanTextSegment(content: string, structural: boolean): string {
  const output: string[] = [];
  const lines = content.split("\n");
  let previousBlank = true;

  const pushBlank = () => {
    if (!previousBlank && output.length > 0) {
      output.push("");
      previousBlank = true;
    }
  };

  for (const raw of lines) {
    if (isMeaninglessSeparator(raw)) {
      pushBlank();
      continue;
    }

    const trimmed = raw.trim();
    if (!trimmed) {
      pushBlank();
      continue;
    }

    const heading = normalizeHeading(trimmed);
    if (heading) {
      pushBlank();
      output.push(heading);
      output.push("");
      previousBlank = true;
      continue;
    }

    const list = normalizeList(raw);
    if (list) {
      output.push(list);
      previousBlank = false;
      continue;
    }

    const table = normalizeTable(raw);
    if (table) {
      output.push(table);
      previousBlank = false;
      continue;
    }

    const speaker = structural ? normalizeSpeakerLine(trimmed) : null;
    output.push(speaker ?? normalizeInlineSpaces(trimmed));
    previousBlank = false;
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function enforceMarkdownSpacing(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];

  for (const line of lines) {
    const isHeading = /^#{1,6}\s+\S/.test(line);
    const previous = output[output.length - 1];

    if (isHeading && previous && previous.trim() !== "") {
      output.push("");
    }

    output.push(line);

    if (isHeading) {
      const nextWasBlank = output[output.length - 1] === "";
      if (!nextWasBlank) {
        output.push("");
      }
    }
  }

  return output.join("\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```.*\n?|\n?```$/g, ""))
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
