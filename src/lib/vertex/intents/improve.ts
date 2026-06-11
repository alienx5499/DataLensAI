import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum } from '../data-utils';

const keywords = [
  'improve',
  'forecast',
  'predict',
  'next year',
  'next quarter',
  'next month',
  'projection',
  'future',
];

export const improveIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample }): IntentResult {
    const agg = aggregate(sample, catCol, numCol);
    const tail = agg.slice(-8);
    const values = tail.map((d) => d.value);
    const data = values.map((v, i) => ({
      name: tail[i]?.name || `P${i + 1}`,
      value: v,
    }));
    const sorted = [...agg].sort((a, b) => a.value - b.value);
    const weakest = sorted.slice(0, 3);
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    const potential = weakest.reduce((s, d) => s + (avg - d.value), 0);
    const findings =
      `Growth opportunities I see:\n\n` +
      `The lowest performers are **${weakest.map((d) => d.name).join(', ')}** - ` +
      `these are your biggest improvement targets.\n\n` +
      `• Current average ${numCol}: **${formatNum(avg)}**\n` +
      `• Potential lift: **+${formatNum(potential)}** if bottom reach average\n` +
      `• These 3 groups are dragging the dataset down by **${formatNum(sorted[0]?.value || 0)}** below the mean\n\n` +
      `**Action**: replicate what is working in the top groups, then apply to the bottom 3.`;
    return {
      chartType: 'line',
      title: `Growth potential - ${catCol} vs ${numCol}`,
      data,
      findings,
    };
  },
};
