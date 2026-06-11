import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum } from '../data-utils';

const keywords = [
  'trend',
  'over time',
  'growth',
  'month',
  'week',
  'daily',
  'timeline',
];

export const trendIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample }): IntentResult {
    const agg = aggregate(sample, catCol, numCol);
    const tail = agg.slice(0, 10);
    const data = tail.map((d) => ({ name: d.name, value: d.value }));
    const values = tail.map((d) => d.value);
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const direction =
      values.length > 1 && values[values.length - 1] > values[0]
        ? 'upward'
        : values[values.length - 1] < values[0]
          ? 'downward'
          : 'stable';
    const swing = max - min;
    const findings =
      `**${numCol} is trending ${direction}** across the period.\n\n` +
      `• Range: **${formatNum(min)} → ${formatNum(max)}** (swing of ${formatNum(swing)})\n` +
      `• Average: **${formatNum(avg)}**\n` +
      `• Showing ${values.length} data points across ${catCol}\n\n` +
      `**Takeaway**: the ${direction} trend suggests ${
        direction === 'upward'
          ? 'positive momentum - keep doing what works'
          : 'a need to investigate what is slowing the curve'
      }.`;
    return {
      chartType: 'line',
      title: `${numCol} trend across ${catCol}`,
      data,
      findings,
    };
  },
};
