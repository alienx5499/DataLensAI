'use client';
import { create } from 'zustand';
import type { AnalysisSession, ChatMessage, DataProfile } from '@/types';
import { useHistoryStore } from './history';
import { useChatStore } from './chat';

interface SessionState {
  currentSession: AnalysisSession | null;
  data: Record<string, unknown>[];
  setUpload: (profile: DataProfile, data: Record<string, unknown>[]) => void;
  loadSession: (session: AnalysisSession) => void;
  updateSession: (session: AnalysisSession) => void;
  resetCurrent: () => void;
}

function buildMessagesFromSession(session: AnalysisSession): ChatMessage[] {
  return [
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
  ];
}

// Session store is the orchestrator: setUpload/loadSession/resetCurrent fan out
// to history (persist) and chat (messages). Sibling stores stay leaves.
export const useSessionStore = create<SessionState>()((set) => ({
  currentSession: null,
  data: [],

  setUpload: (profile, data) => {
    const session: AnalysisSession = {
      id: crypto.randomUUID(),
      fileName: profile.fileName,
      profile,
      entries: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentSession: session, data });
    useHistoryStore.getState().upsertSession(session);
    useChatStore.getState().reset();
  },

  // Historical view is read-only — dataset not reloaded.
  loadSession: (session) => {
    set({ currentSession: session, data: [] });
    useChatStore.getState().loadMessages(buildMessagesFromSession(session));
  },

  updateSession: (session) => {
    set({ currentSession: session });
    useHistoryStore.getState().upsertSession(session);
  },

  resetCurrent: () => {
    set({ currentSession: null, data: [] });
    useChatStore.getState().reset();
  },
}));
