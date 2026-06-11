import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum, formatPct } from '../data-utils';

const keywords = [
  'distribut',
  'breakdown',
  'split',
  'share',
  'proportion',
  'pie',
];

export const distributeIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample }): IntentResult {
    const agg = aggregate(sample, catCol, numCol).slice(0, 6);
    const total = agg.reduce((s, d) => s + d.value, 0) || 1;
    const findings =
      `Here is how ${catCol} breaks down:\n\n` +
      agg
        .slice(0, 4)
        .map(
          (d) =>
            `• **${d.name}** - ${formatPct(d.value / total)} (${formatNum(d.value)})`
        )
        .join('\n') +
      `\n\nTotal across all groups: **${formatNum(total)}**.\n\n` +
      `**Insight**: ${
        agg[0]
          ? `${agg[0].name} dominates with ${formatPct((agg[0].value || 0) / total)}`
          : 'The distribution is fairly even'
      }.`;
    return {
      chartType: 'pie',
      title: `${catCol} distribution`,
      data: agg,
      findings,
    };
  },
};
