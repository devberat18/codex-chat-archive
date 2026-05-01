import { MessageSquareText } from "lucide-react";
import { useSessionStore } from "../../app/useSessionStore";
import type { SessionFileMeta } from "../../core/types";

export function SessionList() {
  const { files, selectedFilePath, loading, selectSession } = useSessionStore();

  if (loading && files.length === 0) {
    return <div className="p-4 text-sm text-stone-600">Yükleniyor...</div>;
  }

  if (files.length === 0) {
    return <div className="p-4 text-sm text-stone-600">Session bulunamadı.</div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-2">
      {files.map((file) => (
        <SessionListItem
          key={file.path}
          file={file}
          selected={file.path === selectedFilePath}
          onSelect={() => void selectSession(file)}
        />
      ))}
    </div>
  );
}

interface SessionListItemProps {
  readonly file: SessionFileMeta;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

function SessionListItem({ file, selected, onSelect }: SessionListItemProps) {
  return (
    <button
      className={[
        "mb-1 flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-white",
        selected ? "bg-white shadow-sm ring-1 ring-emerald-700" : "bg-transparent",
      ].join(" ")}
      onClick={onSelect}
    >
      <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{file.name}</span>
        <span className="block truncate text-xs text-stone-600">{formatDate(file.modified_ms)}</span>
        <span className="block text-xs text-stone-500">{formatBytes(file.size_bytes)}</span>
      </span>
    </button>
  );
}

function formatDate(value: number | null): string {
  if (value === null) {
    return "Tarih yok";
  }
  return new Date(value).toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
