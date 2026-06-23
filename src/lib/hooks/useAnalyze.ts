'use client';
import { useSessionStore } from '@/lib/store/session';
import { useChatStore } from '@/lib/store/chat';
import { selectAnalysisHistory } from '@/lib/store/selectors';
import { ANALYZE_ENDPOINT, ANALYZE_DATA_SAMPLE_SIZE } from '@/lib/constants';
import type { AnalysisResult } from '@/types';

function errorResult(findings: string, limitations: string): AnalysisResult {
  return { chartConfig: null, findings, limitations, stats: {} };
}

export function useAnalyze() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const data = useSessionStore((s) => s.data);
  const isAnalyzing = useChatStore((s) => s.isAnalyzing);
  const messages = useChatStore((s) => s.messages);
  const { addUserMessage, startStreaming, finishStreaming } =
    useChatStore.getState();

  const send = async (question: string) => {
    if (!currentSession) return;
    addUserMessage(question);
    const id = startStreaming();
    try {
      const res = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          profile: currentSession.profile,
          dataSample: data.slice(0, ANALYZE_DATA_SAMPLE_SIZE),
          history: selectAnalysisHistory(currentSession),
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'unable to interpret dataset';
        try {
          const errorObj = JSON.parse(errorText);
          if (errorObj.error) {
            errorMessage = errorObj.error.replace(/^Analysis failed:\s*/i, '');
          }
        } catch {
          // ignore parsing error, fallback to default error message
        }
        finishStreaming(
          id,
          errorResult(
            `Analysis failed: ${errorMessage}`,
            'Please try again with a different question or verify the dataset structure.'
          )
        );
        return;
      }
      const text = await res.text();
      try {
        finishStreaming(id, JSON.parse(text));
      } catch {
        finishStreaming(
          id,
          errorResult(
            'Malformed response from server.',
            'Try rephrasing your question.'
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      finishStreaming(
        id,
        errorResult('Network error.', `Details: ${msg}. Check your connection and try again.`)
      );
    }
  };

  const lastAssistant = messages.findLast(
    (m) => m.role === 'assistant' && m.result
  );
  return {
    send,
    isAnalyzing,
    suggestions: lastAssistant?.result?.suggestions ?? [],
  };
}
