import { aggregate, pickCategoryColumn, pickNumberColumn } from './data-utils';
import type { ColumnInfo, IntentHandler } from './types';
import { introIntent } from './intents/intro';
import { topIntent } from './intents/top';
import { improveIntent } from './intents/improve';
import { trendIntent } from './intents/trend';
import { distributeIntent } from './intents/distribute';
import { correlateIntent } from './intents/correlate';
import { averagesIntent } from './intents/averages';
import { explainIntent } from './intents/explain';
import { fallbackIntent } from './intents/fallback';

const INTENTS: IntentHandler[] = [
  introIntent,
  topIntent,
  improveIntent,
  trendIntent,
  distributeIntent,
  correlateIntent,
  averagesIntent,
  explainIntent,
  fallbackIntent,
];

const LIMITATIONS =
  'Based on sample data. Full dataset may show different patterns.';

export function generateMock(
  question: string,
  profile: unknown,
  dataSample: unknown[]
) {
  const q = question.toLowerCase().trim();
  const p = profile as { totalRows?: number; columns?: ColumnInfo[] };
  const cols = p?.columns || [];
  const sample = (dataSample as Record<string, unknown>[]) || [];
  const totalRows = p?.totalRows || sample.length || 12;

  if (sample.length === 0 || cols.length === 0) {
    return wrap(
      placeholder(),
      LIMITATIONS,
      totalRows,
      sample,
      'category',
      'value'
    );
  }

  const catCol = pickCategoryColumn(cols, sample);
  const numCol = pickNumberColumn(cols, sample);

  for (const intent of INTENTS) {
    if (intent.matches(q)) {
      const result = intent.handle({
        question,
        catCol,
        numCol,
        sample,
        columns: cols,
      });
      return wrap(
        result,
        LIMITATIONS,
        totalRows,
        sample,
        cols[0]?.name,
        numCol
      );
    }
  }

  const agg = aggregate(sample, catCol, numCol).slice(0, 8);
  const result = {
    chartType: 'bar' as const,
    title: `${catCol} vs ${numCol}`,
    data: agg,
    findings: '',
  };
  return wrap(result, LIMITATIONS, totalRows, sample, cols[0]?.name, numCol);
}

function wrap(
  result: {
    chartType: 'bar' | 'line' | 'pie' | 'scatter';
    title: string;
    data: { name: string; value: number }[];
    findings: string;
  },
  limitations: string,
  totalRows: number,
  sample: Record<string, unknown>[],
  xAxis: string | undefined,
  yAxis: string | undefined
) {
  return {
    chartConfig: {
      type: result.chartType,
      title: result.title,
      xAxis: xAxis || 'category',
      yAxis: yAxis || 'value',
      data: result.data,
    },
    findings: result.findings,
    limitations,
    suggestions: [
      'Show me the top performers',
      'Plot a trend over time',
      'Break down by category',
    ],
    stats: { totalRows, matchingRows: sample.length },
  };
}

function placeholder() {
  return {
    chartType: 'bar' as const,
    title: 'Sample Analysis',
    data: [
      { name: 'Sample A', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample B', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample C', value: Math.floor(Math.random() * 5000) + 1000 },
    ],
    findings:
      'Upload data to see real analysis - currently showing placeholder values.',
  };
}
