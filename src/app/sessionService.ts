import { invoke } from "@tauri-apps/api/core";
import { parseJsonl } from "../core/codexJsonlParser";
import { reconstructCodexMessages } from "../core/codexMessageReconstructor";
import { exportSessionJson } from "../core/exportJson";
import { exportSessionMarkdown } from "../core/exportMarkdown";
import type { LoadedSession, SessionFileMeta, SessionSearchResult } from "../core/types";

export async function getDefaultCodexSessionsPath(): Promise<string> {
  return invoke<string>("get_default_codex_sessions_path");
}

export async function listSessionFiles(path: string): Promise<SessionFileMeta[]> {
  return invoke<SessionFileMeta[]>("list_session_files", { path });
}

export async function loadSession(file: SessionFileMeta): Promise<LoadedSession> {
  const content = await invoke<string>("read_session_file", { path: file.path });
  const parsedLines = parseJsonl(content);
  const messages = reconstructCodexMessages(parsedLines);

  return {
    file,
    messages,
    parsedLines,
    skippedLineCount: parsedLines.filter((line) => !line.ok).length,
  };
}

export async function saveSessionMarkdown(session: LoadedSession, exportPath: string): Promise<void> {
  await invoke("save_export_file", {
    path: exportPath,
    content: exportSessionMarkdown(session),
  });
}

export async function saveSessionJson(session: LoadedSession, exportPath: string): Promise<void> {
  await invoke("save_export_file", {
    path: exportPath,
    content: exportSessionJson(session),
  });
}

export function searchSession(session: LoadedSession | null, query: string): SessionSearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!session || normalizedQuery.length === 0) {
    return [];
  }

  return session.messages.flatMap((message) => {
    const haystack = `${message.title ?? ""}\n${message.content}`.toLocaleLowerCase();
    const matchIndex = haystack.indexOf(normalizedQuery);

    if (matchIndex === -1) {
      return [];
    }

    const contentStart = Math.max(0, message.content.toLocaleLowerCase().indexOf(normalizedQuery) - 48);
    const excerpt = message.content.slice(contentStart, contentStart + 160).replace(/\s+/g, " ");

    return [
      {
        messageId: message.id,
        role: message.role,
        excerpt,
      },
    ];
  });
}
