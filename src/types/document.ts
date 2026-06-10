export type CleanMode = "clean" | "structure";

export type ProtectedSegmentKind = "text" | "code" | "math";

export interface ProtectedSegment {
  kind: ProtectedSegmentKind;
  content: string;
}

export interface CleanOptions {
  mode: CleanMode;
  collapseBlankLines?: boolean;
}

export interface CleanResult {
  markdown: string;
  plainText: string;
  warnings: string[];
}

export interface Slide {
  title: string;
  bullets: string[];
  speakerNotes?: string;
}
