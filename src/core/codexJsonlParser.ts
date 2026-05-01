import type { JsonValue, ParsedJsonlLine } from "./types";

export function parseJsonl(content: string): ParsedJsonlLine[] {
  return content.split(/\r?\n/).flatMap((raw, index): ParsedJsonlLine[] => {
    const lineNumber = index + 1;
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return [];
    }

    try {
      return [
        {
          lineNumber,
          raw,
          ok: true,
          value: JSON.parse(trimmed) as JsonValue,
        },
      ];
    } catch (error) {
      return [
        {
          lineNumber,
          raw,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown JSON parse error",
        },
      ];
    }
  });
}
