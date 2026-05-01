import { useEffect, useMemo, useState } from "react";
import { Download, FileJson, FolderOpen, RefreshCw } from "lucide-react";
import { useSessionStore } from "../../app/useSessionStore";
import { ChatView } from "./ChatView";
import { SearchBar } from "./SearchBar";
import { SessionList } from "./SessionList";

export function Layout() {
  const {
    sessionsPath,
    selectedSession,
    loading,
    loadingSession,
    error,
    exportStatus,
    initialize,
    refreshFiles,
    setSessionsPath,
    exportMarkdown,
    exportJson,
  } = useSessionStore();
  const [exportPath, setExportPath] = useState("");

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const defaultExportBase = useMemo(() => {
    if (!selectedSession) {
      return "";
    }
    return selectedSession.file.path.replace(/\.(jsonl|json|log)$/i, "");
  }, [selectedSession]);

  useEffect(() => {
    setExportPath(defaultExportBase ? `${defaultExportBase}.md` : "");
  }, [defaultExportBase]);

  return (
    <div className="flex h-screen min-h-0 bg-[#f7f5ef] text-stone-950">
      <aside className="flex w-[360px] min-w-[300px] max-w-[420px] flex-col border-r border-stone-300 bg-[#ebe7dc]">
        <div className="border-b border-stone-300 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-emerald-800" aria-hidden />
            <h1 className="text-lg font-semibold">Codex Sessions</h1>
          </div>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
              value={sessionsPath}
              onChange={(event) => setSessionsPath(event.target.value)}
              aria-label="Session klasörü"
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 disabled:opacity-50"
              onClick={() => void refreshFiles()}
              disabled={loading}
              title="Yenile"
              aria-label="Yenile"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        <SessionList />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[76px] flex-wrap items-center gap-3 border-b border-stone-300 bg-[#fbfaf7] px-5 py-3">
          <SearchBar />
          <div className="ml-auto flex min-w-[280px] flex-1 justify-end gap-2">
            <input
              className="min-w-[220px] max-w-[520px] flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
              value={exportPath}
              onChange={(event) => setExportPath(event.target.value)}
              disabled={!selectedSession}
              aria-label="Export path"
            />
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40"
              disabled={!selectedSession || exportPath.trim().length === 0}
              onClick={() => void exportMarkdown(exportPath)}
              title="Markdown export"
              aria-label="Markdown export"
            >
              <Download className="h-4 w-4" aria-hidden />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-white hover:bg-black disabled:opacity-40"
              disabled={!selectedSession || exportPath.trim().length === 0}
              onClick={() => void exportJson(exportPath.replace(/\.md$/i, ".json"))}
              title="JSON export"
              aria-label="JSON export"
            >
              <FileJson className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </header>

        {(error || exportStatus) && (
          <div className="border-b border-stone-300 bg-white px-5 py-2 text-sm">
            {error ? <span className="text-red-700">{error}</span> : null}
            {exportStatus ? <span className="text-emerald-800">{exportStatus}</span> : null}
          </div>
        )}

        <ChatView loading={loadingSession} />
      </main>
    </div>
  );
}
