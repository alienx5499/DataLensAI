import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { UploadZone } from '@/components/UploadZone';

const PlasmaWave = dynamic(() => import('@/components/PlasmaWave'), {
  ssr: false,
  loading: () => null,
});

export function Hero() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto bg-black text-white">
      <div className="absolute inset-0 pointer-events-none">
        <PlasmaWave
          colors={['#10B981', '#3B82F6', '#8B5CF6']}
          bend1={1.2}
          bend2={0.6}
          speed1={0.08}
          speed2={0.12}
          focalLength={1.0}
          yOffset={0.15}
          rotationDeg={20}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-white/90">
            Powered by Gemini 2.5 Flash
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance leading-[1.05] text-white">
          See your data.
          <br />
          <span className="text-primary">Ask anything.</span>
        </h1>
        <p className="text-base md:text-lg text-white/70 mt-6 text-pretty max-w-xl mx-auto">
          Drop in a CSV. Get rigorous analysis with charts, plain-English
          findings, and honest limitations - no SQL, no Python.
        </p>
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <UploadZone />
      </div>
      <div className="relative z-10 mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold mb-1.5 text-white">
            Auto-profiled
          </h3>
          <p className="text-xs text-white/60 text-pretty">
            Schema, types, distributions detected.
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold mb-1.5 text-white">
            Honest insights
          </h3>
          <p className="text-xs text-white/60 text-pretty">
            Every finding states limitations.
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold mb-1.5 text-white">Iterative</h3>
          <p className="text-xs text-white/60 text-pretty">
            Follow-ups build on context.
          </p>
        </div>
      </div>
    </div>
  );
}
