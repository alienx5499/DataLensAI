'use client';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import Strands from '@/components/Strands';
import { EMERALD } from '@/lib/theme';

const THINKING_LINES = [
  'Thinking beautifully',
  'Crunching the numbers',
  'Reading between the rows',
  'Warming up the neurons',
  'Brewing insights',
  'Untangling the data',
  'Squinting at the outliers',
  'Polishing the chart',
  'Channeling inner analyst',
  'Asking the data nicely',
  'Hunting for the story',
  'Squaring the variance',
  'Smoothing the distribution',
  'Tuning the visualization',
  'Trusting the process',
];

function pick(): string {
  return THINKING_LINES[Math.floor(Math.random() * THINKING_LINES.length)];
}

export function ThinkingIndicator() {
  const [line, setLine] = useState<string>('');

  useEffect(() => {
    setLine(pick());
    const id = setInterval(() => setLine(pick()), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative glass rounded-2xl overflow-hidden border border-primary/20 h-20">
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <Strands
          colors={[EMERALD, '#3B82F6', '#8B5CF6', '#06B6D4']}
          count={4}
          speed={0.6}
          amplitude={0.8}
          waviness={1.2}
          thickness={0.5}
          glow={2.2}
          taper={2.5}
          spread={1.2}
          hueShift={0.1}
          intensity={0.5}
          saturation={1.4}
          opacity={0.7}
          scale={1.4}
          glass={true}
          refraction={1.2}
          dispersion={1.4}
          glassSize={1.2}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
      <div className="relative z-10 flex items-center gap-3 h-full px-6">
        <div className="rounded-xl bg-primary/15 p-2.5 ring-1 ring-primary/30 shrink-0">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <p
          key={line}
          className="text-sm font-medium tracking-tight text-white drop-shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          {line || '...'}
        </p>
        <div className="flex items-center gap-1.5 ml-auto">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
