'use client';
import { AlertCircle, Sparkles, User } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { DataChart } from './chart/DataChart';
import { FindingsRenderer } from './FindingsRenderer';
import { ChartCard } from './chart/ChartCard';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  if (message.role === 'user') {
    return (
      <div className="flex gap-3 justify-end animate-in fade-in slide-in-from-bottom-2">
        <div className="max-w-[80%]">
          <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-md text-sm text-pretty shadow-sm">
            {message.content}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (message.isStreaming && !message.result) {
    return null;
  }

  const result = message.result;
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 max-w-[85%] space-y-3">
        {result?.chartConfig && (
          <ChartCard title={result.chartConfig.title}>
            <DataChart config={result.chartConfig} />
          </ChartCard>
        )}
        {result && (
          <>
            <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
              <FindingsRenderer text={result.findings} />
            </div>
            {result.limitations && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 text-pretty leading-relaxed">
                  {result.limitations}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
