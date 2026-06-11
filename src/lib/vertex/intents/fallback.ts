import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum } from '../data-utils';

export const fallbackIntent: IntentHandler = {
  matches(_q) {
    return true; // Always matches last
  },
  handle({ catCol, numCol, sample, question }): IntentResult {
    const agg = aggregate(sample, catCol, numCol).slice(0, 8);
    const data = agg;
    const total = agg.reduce((s, d) => s + d.value, 0) || 1;
    const findings =
      `Got it - here's my read on **'${question.trim()}'**:\n\n` +
      `• **${agg.length}** ${catCol} groups found\n` +
      `• **Total ${numCol}**: ${formatNum(total)}\n` +
      `• **Top**: ${agg[0]?.name || 'N/A'} leads with **${formatNum(agg[0]?.value || 0)}**\n\n` +
      `Ask a follow-up to drill into any specific group.`;
    return {
      chartType: 'bar',
      title: `${catCol} vs ${numCol}`,
      data,
      findings,
    };
  },
};
