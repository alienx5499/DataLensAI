import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum, formatPct } from '../data-utils';

const keywords = ['top', 'highest', 'best', 'leader', 'most'];

export const topIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample }): IntentResult {
    const agg = aggregate(sample, catCol, numCol).slice(0, 8);
    const top3 = agg.slice(0, 3).reduce((s, d) => s + d.value, 0);
    const total = agg.reduce((s, d) => s + d.value, 0) || 1;
    const topPer = top3 / total;
    const lead = agg[0]?.name || 'N/A';
    const findings =
      `Here's how ${catCol} ranks by ${numCol}:\n\n` +
      `The leader is **${lead}** at ${formatNum(agg[0]?.value || 0)}, ` +
      `accounting for ${formatPct((agg[0]?.value || 0) / total)} of all ${numCol}.\n\n` +
      `Top 3 breakdown:\n` +
      agg
        .slice(0, 3)
        .map((d) => `• **${d.name}** - ${formatNum(d.value)}`)
        .join('\n') +
      `\n\nTotal ${numCol} across all groups: **${formatNum(total)}**.\n\n` +
      `**Recommendation**: double down on the leader's pattern - it contributes ${formatPct(topPer)} of the top 3.`;
    return {
      chartType: 'bar',
      title: `Top ${catCol} by ${numCol}`,
      data: agg,
      findings,
    };
  },
};
