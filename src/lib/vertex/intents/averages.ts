import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum } from '../data-utils';

const keywords = ['average', 'mean', 'total', 'sum'];

export const averagesIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample }): IntentResult {
    const agg = aggregate(sample, catCol, numCol);
    const data = agg.slice(0, 8);
    const total = agg.reduce((s, d) => s + d.value, 0);
    const avg = total / (agg.length || 1);
    const findings =
      `Here is the aggregate view:\n\n` +
      `• **Total ${numCol}**: ${formatNum(total)}\n` +
      `• **Average per ${catCol}**: ${formatNum(avg)}\n` +
      `• **Groups in dataset**: ${agg.length}\n\n` +
      `**Sanity check**: ${total > 0 ? `the data shows real signal` : `the data sums to 0 - check your input`}.`;
    return {
      chartType: 'bar',
      title: `${numCol} totals by ${catCol}`,
      data,
      findings,
    };
  },
};
