import type { ChatMessage, LoadedSession } from "./types";

export function exportSessionMarkdown(session: LoadedSession): string {
  const header = [
    `# ${session.file.name}`,
    "",
    `Source: \`${session.file.path}\``,
    `Messages: ${session.messages.length}`,
    `Skipped JSONL lines: ${session.skippedLineCount}`,
    "",
  ];

  return [...header, ...session.messages.map(formatMessage)].join("\n");
}

function formatMessage(message: ChatMessage): string {
  const title = message.title ? ` - ${message.title}` : "";
  const timestamp = message.timestamp ? ` (${message.timestamp})` : "";

  return [`## ${message.role}${title}${timestamp}`, "", message.content, ""].join("\n");
}
