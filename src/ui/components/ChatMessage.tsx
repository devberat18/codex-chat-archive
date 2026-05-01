import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "../../core/types";

interface ChatMessageProps {
  readonly message: ChatMessageType;
  readonly highlighted: boolean;
}

export function ChatMessage({ message, highlighted }: ChatMessageProps) {
  const frameClass = [
    "rounded-md border p-4",
    message.role === "user" ? "border-emerald-200 bg-emerald-50" : "",
    message.role === "assistant" ? "border-stone-300 bg-white" : "",
    message.role === "tool" ? "border-sky-200 bg-sky-50" : "",
    message.role === "debug" || message.role === "system" ? "border-amber-200 bg-amber-50" : "",
    highlighted ? "ring-2 ring-amber-400" : "",
  ].join(" ");

  const header = (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-stone-600">
      <span>{message.role}</span>
      {message.title ? <span className="normal-case tracking-normal text-stone-500">{message.title}</span> : null}
      {message.timestamp ? <span className="ml-auto normal-case tracking-normal text-stone-500">{message.timestamp}</span> : null}
    </div>
  );

  if (message.collapsed) {
    return (
      <details className={frameClass}>
        <summary className="cursor-pointer list-none">
          {header}
          <span className="text-sm text-stone-700">{message.content.slice(0, 140) || "Detay"}</span>
        </summary>
        <MessageMarkdown content={message.content} />
      </details>
    );
  }

  return (
    <article className={frameClass}>
      {header}
      <MessageMarkdown content={message.content} />
    </article>
  );
}

function MessageMarkdown({ content }: { readonly content: string }) {
  return (
    <div className="markdown-body text-sm leading-6 text-stone-900">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
