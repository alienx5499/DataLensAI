'use client';
import { Sparkles } from 'lucide-react';
import Strands from '@/components/Strands';
import { EMERALD } from '@/lib/theme';

const STAGES = [
  'Reading the shape of your data',
  'Spotting patterns and outliers',
  'Crafting the visualization',
  'Drafting findings',
  'Checking limitations',
];

export function ThinkingIndicator() {
  const stage = STAGES[0];
  return (
    <div className="relative glass rounded-2xl p-6 overflow-hidden border border-primary/20">
      <div className="absolute inset-0 opacity-50 pointer-events-none">
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
          opacity={0.55}
          scale={1.4}
          glass={true}
          refraction={1.2}
          dispersion={1.4}
          glassSize={1.2}
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>
      <div className="relative z-10 flex items-start gap-4">
        <div className="rounded-xl bg-primary/15 p-2.5 ring-1 ring-primary/30">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium tracking-tight text-foreground/90">
            Thinking beautifully
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">{stage}…</p>
          <div className="mt-3 flex items-center gap-1.5">
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
    </div>
  );
}
