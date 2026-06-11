import type { IntentHandler, IntentResult } from '../types';
import { aggregate, formatNum } from '../data-utils';

const keywords = [
  'how',
  'why',
  'explain',
  'describe',
  'what is',
  'tell me',
  'fast',
  'quick',
  'detail',
  'more',
];

export const explainIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample, question }): IntentResult {
    const agg = aggregate(sample, catCol, numCol);
    const data = agg.slice(0, 6);
    const total = agg.reduce((s, d) => s + d.value, 0);
    const avg = total / (agg.length || 1);
    const range = [...agg].sort((a, b) => b.value - a.value);
    const findings =
      `You asked: **'${question.trim()}'**\n\n` +
      `Here is what I see in your data:\n\n` +
      `• **${agg.length}** ${catCol} groups, totaling **${formatNum(total)}** ${numCol}\n` +
      `• **Average per group**: ${formatNum(avg)}\n` +
      `• **Top performer**: ${range[0]?.name || 'N/A'} with **${formatNum(range[0]?.value || 0)}**\n` +
      `• **${sample.length}** rows processed in this sample\n\n` +
      `**Want to go deeper?** Try a follow-up like 'which group has the highest variance?' or 'break down the top performer'.`;
    return {
      chartType: 'bar',
      title: `${catCol} - ${numCol}`,
      data,
      findings,
    };
  },
};
