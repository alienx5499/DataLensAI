'use client';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  suggestions?: string[];
}

export function ChatInput({
  onSend,
  isLoading,
  suggestions = [],
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const submit = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="space-y-3">
      {suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => !isLoading && onSend(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full glass border border-border hover:border-primary/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="glass shadow-glass rounded-2xl p-2 flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask anything about your data..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 outline-none resize-none px-3 py-2 text-sm placeholder:text-muted-foreground/60 max-h-40"
        />
        <Button
          onClick={submit}
          disabled={!value.trim() || isLoading}
          size="icon"
          className="rounded-xl bg-primary hover:bg-primary/90 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
