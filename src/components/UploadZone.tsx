'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseFile } from '@/lib/data-parser';
import { useAppStore } from '@/lib/store';

export function UploadZone() {
  const setUpload = useAppStore((s) => s.setUpload);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, profile } = await parseFile(file);
        setUpload(profile, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsLoading(false);
      }
    },
    [setUpload]
  );

  const loadSample = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/sample-data.csv');
      const blob = await res.blob();
      const file = new File([blob], 'sample-sales.csv', { type: 'text/csv' });
      const { data, profile } = await parseFile(file);
      setUpload(profile, data);
    } catch {
      setError('Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  }, [setUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card
        className="bg-white/5 backdrop-blur-md shadow-glass cursor-pointer transition-all duration-300 hover:shadow-2xl text-white/90 border-white/10"
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="p-12">
          <div
            className={`flex flex-col items-center text-center transition-all ${
              isDragging ? 'scale-105' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Upload className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
            )}
            <h3 className="text-xl font-semibold tracking-tight text-balance">
              {isLoading ? 'Processing your data...' : 'Drop in your data'}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 text-pretty">
              CSV, JSON, or Excel · Up to 10MB
            </p>
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            loadSample();
          }}
          disabled={isLoading}
          className="text-sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Try with sample data
        </Button>
      </div>
    </div>
  );
}
