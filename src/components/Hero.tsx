import { Sparkles } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';

export function Hero() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-border mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">
            Powered by Gemini 2.5 Flash
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05]">
          See your data.
          <br />
          <span className="text-primary">Ask anything.</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-6 text-pretty max-w-xl mx-auto">
          Drop in a CSV. Get rigorous analysis with charts, plain-English
          findings, and honest limitations — no SQL, no Python.
        </p>
      </div>
      <UploadZone />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1.5">Auto-profiled</h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Schema, types, distributions detected.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1.5">Honest insights</h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Every finding states limitations.
          </p>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-1.5">Iterative</h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Follow-ups build on context.
          </p>
        </div>
      </div>
    </div>
  );
}
