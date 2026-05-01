import { useMemo } from "react";
import { useSessionStore } from "../../app/useSessionStore";
import { ChatMessage } from "./ChatMessage";

interface ChatViewProps {
  readonly loading: boolean;
}

export function ChatView({ loading }: ChatViewProps) {
  const { selectedSession, query, searchResults } = useSessionStore();
  const resultIds = useMemo(() => new Set(searchResults.map((result) => result.messageId)), [searchResults]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-sm text-stone-600">Session yükleniyor...</div>;
  }

  if (!selectedSession) {
    return <div className="flex flex-1 items-center justify-center text-sm text-stone-600">Bir session seç.</div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="border-b border-stone-300 pb-3">
          <h2 className="truncate text-xl font-semibold">{selectedSession.file.name}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {selectedSession.messages.length} mesaj, {selectedSession.skippedLineCount} bozuk satır
          </p>
        </div>
        {selectedSession.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            highlighted={query.trim().length > 0 && resultIds.has(message.id)}
          />
        ))}
      </div>
    </div>
  );
}
