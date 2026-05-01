import type { ChatMessage, JsonObject, JsonValue, ParsedJsonlLine } from "./types";

export function reconstructCodexMessages(lines: ParsedJsonlLine[]): ChatMessage[] {
  const messages = lines.flatMap((line) => {
    if (!line.ok) {
      return [
        {
          id: `debug-${line.lineNumber}`,
          role: "debug",
          title: `Unparsed JSONL line ${line.lineNumber}`,
          content: line.raw,
          collapsed: true,
        } satisfies ChatMessage,
      ];
    }

    const value = line.value;
    if (!isObject(value)) {
      return [];
    }

    return messageFromObject(value, line.lineNumber);
  });

  return messages.filter((message, index) => {
    const previous = messages[index - 1];
    return !previous || previous.role !== message.role || previous.content !== message.content;
  });
}

function messageFromObject(event: JsonObject, lineNumber: number): ChatMessage[] {
  const timestamp = findTimestamp(event);
  const type = getString(event, "type") ?? getString(event, "event") ?? getString(event, "kind");
  const role = getString(event, "role");
  const payload = objectAt(event, "payload");

  if (payload) {
    const payloadMessages = messageFromCodexPayload(event, payload, lineNumber, timestamp, type);
    if (payloadMessages.length > 0) {
      return payloadMessages;
    }
  }

  const directMessage = objectAt(event, "message");
  if (directMessage) {
    const messageRole = getString(directMessage, "role") ?? role;
    const content = extractContent(directMessage);
    if (messageRole && content) {
      return [
        {
          id: `message-${lineNumber}`,
          role: normalizeRole(messageRole),
          content,
          timestamp,
          raw: event,
        },
      ];
    }
  }

  const item = objectAt(event, "item");
  if (item) {
    const itemType = getString(item, "type");
    const itemRole = getString(item, "role") ?? role;
    const content = extractContent(item);

    if (itemRole && content) {
      return [
        {
          id: `item-${lineNumber}`,
          role: normalizeRole(itemRole),
          content,
          timestamp,
          raw: event,
        },
      ];
    }

    if (isToolish(itemType)) {
      return [toolMessage(item, lineNumber, timestamp, event)];
    }
  }

  const content = extractContent(event);
  if (role && content) {
    return [
      {
        id: `event-${lineNumber}`,
        role: normalizeRole(role),
        content,
        timestamp,
        raw: event,
      },
    ];
  }

  if (isToolish(type)) {
    return [toolMessage(event, lineNumber, timestamp, event)];
  }

  return [];
}

function messageFromCodexPayload(
  event: JsonObject,
  payload: JsonObject,
  lineNumber: number,
  timestamp: string | undefined,
  eventType: string | undefined,
): ChatMessage[] {
  const payloadType = getString(payload, "type");

  if (eventType === "event_msg" && payloadType === "user_message") {
    const message = getString(payload, "message");
    return message
      ? [
          {
            id: `user-${lineNumber}`,
            role: "user",
            content: message,
            timestamp,
            raw: event,
          },
        ]
      : [];
  }

  if (eventType === "event_msg" && payloadType === "agent_message") {
    const message = getString(payload, "message");
    return message
      ? [
          {
            id: `assistant-${lineNumber}`,
            role: "assistant",
            content: message,
            timestamp,
            raw: event,
          },
        ]
      : [];
  }

  if (eventType === "event_msg" && payloadType === "exec_command_end") {
    return [toolMessage(payload, lineNumber, timestamp, event)];
  }

  if (eventType === "event_msg" && payloadType === "patch_apply_end") {
    return [toolMessage(payload, lineNumber, timestamp, event)];
  }

  if (eventType === "response_item" && isToolish(payloadType)) {
    return [toolMessage(payload, lineNumber, timestamp, event)];
  }

  if (eventType === "response_item" && payloadType === "message") {
    const payloadRole = getString(payload, "role");
    const content = extractContent(payload);

    if (payloadRole && content && payloadRole !== "developer" && !isInternalContent(content)) {
      return [
        {
          id: `response-message-${lineNumber}`,
          role: normalizeRole(payloadRole),
          content,
          timestamp,
          raw: event,
        },
      ];
    }
  }

  return [];
}

function isInternalContent(content: string): boolean {
  const trimmed = content.trimStart();
  return (
    trimmed.startsWith("<environment_context>") ||
    trimmed.startsWith("<permissions instructions>") ||
    trimmed.startsWith("<collaboration_mode>") ||
    trimmed.startsWith("<apps_instructions>") ||
    trimmed.startsWith("<skills_instructions>") ||
    trimmed.startsWith("<plugins_instructions>")
  );
}

function toolMessage(toolEvent: JsonObject, lineNumber: number, timestamp: string | undefined, raw: JsonValue): ChatMessage {
  const type = getString(toolEvent, "type") ?? "tool event";
  const name =
    getString(toolEvent, "name") ??
    getString(toolEvent, "tool_name") ??
    getString(toolEvent, "call_id") ??
    getString(toolEvent, "formatted_output");
  const content = extractContent(toolEvent) ?? stringifyJson(toolEvent);

  return {
    id: `tool-${lineNumber}`,
    role: "tool",
    title: name ? `${type}: ${name}` : type,
    content,
    timestamp,
    collapsed: true,
    raw,
  };
}

function extractContent(value: JsonObject): string | undefined {
  const direct =
    getString(value, "content") ??
    getString(value, "text") ??
    getString(value, "output") ??
    getString(value, "result");

  if (direct) {
    return direct;
  }

  const content = value.content;
  if (Array.isArray(content)) {
    const parts = content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (isObject(part)) {
          return getString(part, "text") ?? getString(part, "content") ?? getString(part, "output");
        }
        return undefined;
      })
      .filter((part): part is string => Boolean(part));

    if (parts.length > 0) {
      return parts.join("\n\n");
    }
  }

  return undefined;
}

function normalizeRole(role: string): ChatMessage["role"] {
  if (role === "user" || role === "assistant" || role === "system" || role === "tool") {
    return role;
  }
  return "debug";
}

function findTimestamp(value: JsonObject): string | undefined {
  return (
    getString(value, "timestamp") ??
    getString(value, "created_at") ??
    getString(value, "time") ??
    getString(value, "ts")
  );
}

function isToolish(type: string | undefined): boolean {
  if (!type) {
    return false;
  }

  return (
    type.includes("tool") ||
    type.includes("function_call") ||
    type.includes("custom_tool_call") ||
    type.includes("command") ||
    type.includes("exec_command") ||
    type.includes("patch_apply")
  );
}

function objectAt(value: JsonObject, key: string): JsonObject | undefined {
  const child = value[key];
  return isObject(child) ? child : undefined;
}

function getString(value: JsonObject, key: string): string | undefined {
  const child = value[key];
  return typeof child === "string" && child.trim().length > 0 ? child : undefined;
}

function stringifyJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
