import type { AnalysisSession } from '@/types';
import { ANALYZE_HISTORY_DEPTH } from '@/lib/constants';

// History pairs are sourced from persisted AnalysisEntry records (authoritative)
// rather than brittle message-array adjacency pairing.
export function selectAnalysisHistory(
  session: AnalysisSession | null
): Array<{ question: string; findings: string }> {
  if (!session) return [];
  return session.entries
    .slice(-ANALYZE_HISTORY_DEPTH)
    .map((e) => ({ question: e.question, findings: e.findings }));
}
