'use client';
import { FileSpreadsheet, Trash2, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export function HistorySidebar({ onClose }: { onClose?: () => void }) {
  const { history, loadSession, deleteSession, currentSession } = useAppStore();

  return (
    <aside className="h-full glass border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">History</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No analyses yet
          </p>
        )}
        {history.map((s) => (
          <button
            key={s.id}
            onClick={() => loadSession(s)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors group ${
              currentSession?.id === s.id
                ? 'bg-primary/10 border border-primary/20'
                : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <FileSpreadsheet className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.fileName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.entries.length}{' '}
                  {s.entries.length === 1 ? 'analysis' : 'analyses'}
                </p>
              </div>
              <Trash2
                className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}