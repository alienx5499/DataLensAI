'use client';
import { FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export function ExportMenu() {
  const session = useAppStore((s) => s.currentSession);

  if (!session || session.entries.length === 0) return null;

  const exportAs = async (format: 'json' | 'csv') => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, session }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datalens-${session.fileName}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" onClick={() => exportAs('json')}>
        <FileJson className="w-4 h-4 mr-1.5" /> JSON
      </Button>
      <Button variant="ghost" size="sm" onClick={() => exportAs('csv')}>
        <FileText className="w-4 h-4 mr-1.5" /> CSV
      </Button>
    </div>
  );
}
