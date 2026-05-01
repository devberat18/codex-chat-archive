import { create } from "zustand";
import type { LoadedSession, SessionFileMeta, SessionSearchResult } from "../core/types";
import {
  getDefaultCodexSessionsPath,
  listSessionFiles,
  loadSession,
  saveSessionJson,
  saveSessionMarkdown,
  searchSession,
} from "./sessionService";

interface SessionState {
  sessionsPath: string;
  files: SessionFileMeta[];
  selectedFilePath: string | null;
  selectedSession: LoadedSession | null;
  query: string;
  searchResults: SessionSearchResult[];
  loading: boolean;
  loadingSession: boolean;
  error: string | null;
  exportStatus: string | null;
  initialize: () => Promise<void>;
  setSessionsPath: (path: string) => void;
  refreshFiles: () => Promise<void>;
  selectSession: (file: SessionFileMeta) => Promise<void>;
  setQuery: (query: string) => void;
  exportMarkdown: (path: string) => Promise<void>;
  exportJson: (path: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionsPath: "",
  files: [],
  selectedFilePath: null,
  selectedSession: null,
  query: "",
  searchResults: [],
  loading: false,
  loadingSession: false,
  error: null,
  exportStatus: null,

  async initialize() {
    set({ loading: true, error: null });
    try {
      const sessionsPath = await getDefaultCodexSessionsPath();
      set({ sessionsPath });
      await get().refreshFiles();
    } catch (error) {
      set({ error: errorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  setSessionsPath(path) {
    set({ sessionsPath: path });
  },

  async refreshFiles() {
    const { sessionsPath } = get();
    if (!sessionsPath.trim()) {
      set({ error: "Session path is empty" });
      return;
    }

    set({ loading: true, error: null, exportStatus: null });
    try {
      const files = await listSessionFiles(sessionsPath.trim());
      set({ files });
    } catch (error) {
      set({ error: errorMessage(error), files: [] });
    } finally {
      set({ loading: false });
    }
  },

  async selectSession(file) {
    set({
      selectedFilePath: file.path,
      loadingSession: true,
      error: null,
      exportStatus: null,
    });

    try {
      const selectedSession = await loadSession(file);
      set((state) => ({
        selectedSession,
        searchResults: searchSession(selectedSession, state.query),
      }));
    } catch (error) {
      set({ error: errorMessage(error), selectedSession: null, searchResults: [] });
    } finally {
      set({ loadingSession: false });
    }
  },

  setQuery(query) {
    set((state) => ({
      query,
      searchResults: searchSession(state.selectedSession, query),
    }));
  },

  async exportMarkdown(path) {
    const { selectedSession } = get();
    if (!selectedSession) {
      set({ error: "No selected session to export" });
      return;
    }

    try {
      await saveSessionMarkdown(selectedSession, path);
      set({ exportStatus: `Markdown exported to ${path}`, error: null });
    } catch (error) {
      set({ error: errorMessage(error), exportStatus: null });
    }
  },

  async exportJson(path) {
    const { selectedSession } = get();
    if (!selectedSession) {
      set({ error: "No selected session to export" });
      return;
    }

    try {
      await saveSessionJson(selectedSession, path);
      set({ exportStatus: `JSON exported to ${path}`, error: null });
    } catch (error) {
      set({ error: errorMessage(error), exportStatus: null });
    }
  },
}));

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === "string" ? error : "Unknown error";
}
