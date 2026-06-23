'use client';
import { useState, useRef, useEffect } from 'react';
import { BarChart3, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { HistorySidebar } from '@/components/HistorySidebar';
import { ExportMenu } from '@/components/ExportMenu';
import { useSessionStore } from '@/lib/store/session';
import { useChatStore } from '@/lib/store/chat';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { DataTable } from '@/components/DataTable';

export function AppShell() {
  const currentSession = useSessionStore((s) => s.currentSession);
  const data = useSessionStore((s) => s.data);
  const messages = useChatStore((s) => s.messages);
  const { send, isAnalyzing, suggestions } = useAnalyze();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-lg font-medium text-white">No dataset uploaded yet</p>
          <p className="text-sm">
            Please upload a dataset (.csv, .xlsx, or .json) on the home page to start analyzing your data with AI Data Lens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="glass shadow-sm border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
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
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <BarChart3
                className="w-4 h-4 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                AI Data Lens
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none">
                Conversational analytics
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu />
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

          <div className="border-t border-border p-4 bg-background/50 backdrop-blur">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={send}
                isLoading={isAnalyzing}
                suggestions={suggestions}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
