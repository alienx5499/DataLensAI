'use client';
import type { ChartConfig } from '@/types';
import { CHART_VIEWS } from '@/lib/chart-registry';

export function DataChart({ config }: { config: ChartConfig }) {
  const { type, data } = config;
  const effectiveType = type || 'bar';
  const View = CHART_VIEWS[effectiveType];

  if (!data || !Array.isArray(data) || data.length === 0 || !View) {
    return (
      <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return <View data={data} />;
}
