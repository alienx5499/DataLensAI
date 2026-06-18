'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnalysisSession } from '@/types';

interface HistoryState {
  history: AnalysisSession[];
  upsertSession: (session: AnalysisSession) => void;
  deleteSession: (id: string) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],

      // Move-to-front (MRU); new + existing sessions land at top.
      upsertSession: (session) => {
        set({
          history: [
            session,
            ...get().history.filter((s) => s.id !== session.id),
          ],
        });
      },

      deleteSession: (id) => {
        set({ history: get().history.filter((s) => s.id !== id) });
      },
    }),
    {
      name: 'datalens-storage',
      partialize: (state) => ({ history: state.history }),
    }
  )
);
