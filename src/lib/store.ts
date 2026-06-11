'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AnalysisSession,
  AnalysisEntry,
  ChatMessage,
  DataProfile,
  AnalysisResult,
} from '@/types';

interface AppState {
  currentSession: AnalysisSession | null;
  messages: ChatMessage[];
  data: Record<string, unknown>[];
  history: AnalysisSession[];
  isAnalyzing: boolean;

  setUpload: (profile: DataProfile, data: Record<string, unknown>[]) => void;
  addUserMessage: (content: string) => void;
  startStreaming: () => string;
  appendStreamChunk: (id: string, chunk: string) => void;
  finishStreaming: (id: string, result: AnalysisResult) => void;
  loadSession: (session: AnalysisSession) => void;
  deleteSession: (id: string) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      messages: [],
      data: [],
      history: [],
      isAnalyzing: false,

      setUpload: (profile, data) => {
        const session: AnalysisSession = {
          id: crypto.randomUUID(),
          fileName: profile.fileName,
          profile,
          entries: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({
          currentSession: session,
          data,
          messages: [],
          history: [
            session,
            ...get().history.filter((s) => s.id !== session.id),
          ],
        });
      },

      addUserMessage: (content) => {
        const msg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: Date.now(),
        };
        set({ messages: [...get().messages, msg] });
      },

      startStreaming: () => {
        const id = crypto.randomUUID();
        const msg: ChatMessage = {
          id,
          role: 'assistant',
          content: '',
          isStreaming: true,
          timestamp: Date.now(),
        };
        set({ messages: [...get().messages, msg], isAnalyzing: true });
        return id;
      },

      appendStreamChunk: (id, chunk) => {
        set({
          messages: get().messages.map((m) =>
            m.id === id ? { ...m, content: m.content + chunk } : m
          ),
        });
      },

      finishStreaming: (id, result) => {
        const { currentSession, messages } = get();
        if (!currentSession) return;
        const userMsg = [...messages].reverse().find((m) => m.role === 'user');
        const entry: AnalysisEntry = {
          id,
          question: userMsg?.content || '',
          ...result,
          timestamp: Date.now(),
        };
        const updatedSession = {
          ...currentSession,
          entries: [...currentSession.entries, entry],
          updatedAt: Date.now(),
        };
        set({
          messages: messages.map((m) =>
            m.id === id
              ? { ...m, isStreaming: false, result, content: result.findings }
              : m
          ),
          currentSession: updatedSession,
          history: get().history.map((s) =>
            s.id === updatedSession.id ? updatedSession : s
          ),
          isAnalyzing: false,
        });
      },

      loadSession: (session) => {
        set({
          currentSession: session,
          data: [],
          messages: [
            ...session.entries.map((e) => ({
              id: e.id,
              role: 'user' as const,
              content: e.question,
              timestamp: e.timestamp,
            })),
            ...session.entries.map((e) => ({
              id: crypto.randomUUID(),
              role: 'assistant' as const,
              content: e.findings,
              result: {
                chartConfig: e.chartConfig,
                findings: e.findings,
                limitations: e.limitations,
                stats: e.stats,
                suggestions: e.suggestions,
              },
              timestamp: e.timestamp,
            })),
          ] as ChatMessage[],
        });
      },

      deleteSession: (id) => {
        set({ history: get().history.filter((s) => s.id !== id) });
      },

      clearAll: () => {
        set({ currentSession: null, messages: [], data: [], history: [] });
      },
    }),
    {
      name: 'datalens-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
