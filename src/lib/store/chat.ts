'use client';
import { create } from 'zustand';
import type { AnalysisEntry, AnalysisResult, ChatMessage } from '@/types';
import { useSessionStore } from './session';

interface ChatState {
  messages: ChatMessage[];
  isAnalyzing: boolean;
  addUserMessage: (content: string) => void;
  startStreaming: () => string;
  appendStreamChunk: (id: string, chunk: string) => void;
  finishStreaming: (id: string, result: AnalysisResult) => void;
  loadMessages: (msgs: ChatMessage[]) => void;
  reset: () => void;
}

// Chat owns the streaming transcript. finishStreaming persists the entry to
// the active session via session.updateSession (orchestrator pattern).
export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isAnalyzing: false,

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
    set({
      messages: [
        ...get().messages,
        {
          id,
          role: 'assistant',
          content: '',
          isStreaming: true,
          timestamp: Date.now(),
        },
      ],
      isAnalyzing: true,
    });
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
    const { messages } = get();
    const currentSession = useSessionStore.getState().currentSession;
    if (!currentSession) {
      set({ isAnalyzing: false });
      return;
    }
    const userMsg = messages.findLast((m) => m.role === 'user');
    if (!userMsg) {
      set({ isAnalyzing: false });
      return;
    }
    const entry: AnalysisEntry = {
      id,
      question: userMsg.content,
      ...result,
      timestamp: Date.now(),
    };
    const updatedSession = {
      ...currentSession,
      entries: [...currentSession.entries, entry],
      updatedAt: Date.now(),
    };
    // Streamed content is preview; final `content` is canonical findings text.
    set({
      messages: messages.map((m) =>
        m.id === id
          ? { ...m, isStreaming: false, result, content: result.findings }
          : m
      ),
      isAnalyzing: false,
    });
    useSessionStore.getState().updateSession(updatedSession);
  },

  loadMessages: (msgs) => {
    set({ messages: msgs, isAnalyzing: false });
  },
  reset: () => {
    set({ messages: [], isAnalyzing: false });
  },
}));
