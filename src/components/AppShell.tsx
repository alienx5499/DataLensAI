'use client';
import { useState, useRef, useEffect } from 'react';
import { BarChart3, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ExportMenu } from '@/components/ExportMenu';
import { useAppStore } from '@/lib/store';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { DataTable } from '@/components/DataTable';

export function AppShell() {
  const {
    currentSession,
    messages,
    data,
    addUserMessage,
    startStreaming,
    finishStreaming,
    isAnalyzing,
  } = useAppStore();
  if (!currentSession) return null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = async (question: string) => {
    if (!currentSession) return;
    addUserMessage(question);
    const id = startStreaming();

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          profile: currentSession.profile,
          dataSample: data.slice(0, 5),
          history: messages
            .filter((m) => m.role === 'assistant' && m.result)
            .slice(-3)
            .map((m) => ({
              question: messages[messages.indexOf(m) - 1]?.content || '',
              findings: m.result!.findings,
            })),
        }),
      });

      if (!res.ok || !res.body) {
        finishStreaming(id, {
          chartConfig: null,
          findings: 'Analysis service unavailable.',
          limitations: 'Check API configuration.',
          stats: {},
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: false });
      }

      try {
        const result = JSON.parse(buffer);
        finishStreaming(id, result);
      } catch {
        finishStreaming(id, {
          chartConfig: null,
          findings: 'Malformed response from server.',
          limitations: 'Try rephrasing your question.',
          stats: {},
        });
      }
    } catch (err) {
      finishStreaming(id, {
        chartConfig: null,
        findings: 'Network error.',
        limitations: err instanceof Error ? err.message : 'Unknown',
        stats: {},
      });
    }
  };

  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.result);
  const suggestions = lastAssistant?.result?.suggestions || [];

  return (
    <>
      <header className="glass border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <BarChart3
                className="w-4 h-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                DataLensAI
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                Conversational analytics
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentSession && <ExportMenu />}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block w-64 shrink-0">
          <HistorySidebar />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72">
              <HistorySidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {currentSession.fileName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {currentSession.profile.rowCount} rows ·{' '}
                    {currentSession.profile.columns.length} columns
                  </p>
                </div>
              </div>
              {messages.length === 0 && data.length > 0 && (
                <div className="space-y-3">
                  <DataTable data={data} pageSize={5} />
                  <p className="text-xs text-muted-foreground text-center">
                    Ask a question to start
                  </p>
                </div>
              )}
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {isAnalyzing && <ThinkingIndicator />}
            </div>
          </div>

          {currentSession && (
            <div className="border-t border-border p-4 bg-background/50 backdrop-blur">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSend={handleSend}
                  isLoading={isAnalyzing}
                  suggestions={suggestions}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
