export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export type CodexRole = "user" | "assistant" | "tool" | "debug" | "system";

export interface ParsedJsonlLine {
  readonly lineNumber: number;
  readonly raw: string;
  readonly ok: boolean;
  readonly value?: JsonValue;
  readonly error?: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: CodexRole;
  readonly content: string;
  readonly timestamp?: string;
  readonly title?: string;
  readonly collapsed?: boolean;
  readonly raw?: JsonValue;
}

export interface SessionFileMeta {
  readonly path: string;
  readonly name: string;
  readonly modified_ms: number | null;
  readonly size_bytes: number;
}

export interface LoadedSession {
  readonly file: SessionFileMeta;
  readonly messages: ChatMessage[];
  readonly parsedLines: ParsedJsonlLine[];
  readonly skippedLineCount: number;
}

export interface SessionSearchResult {
  readonly messageId: string;
  readonly role: CodexRole;
  readonly excerpt: string;
}
