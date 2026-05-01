import type { LoadedSession } from "./types";

export function exportSessionJson(session: LoadedSession): string {
  return JSON.stringify(
    {
      file: session.file,
      skippedLineCount: session.skippedLineCount,
      messages: session.messages,
    },
    null,
    2,
  );
}
