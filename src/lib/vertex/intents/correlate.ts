import type { IntentHandler, IntentResult } from '../types';
import { formatNum } from '../data-utils';

const keywords = ['correlat', 'relationship', 'vs ', 'versus'];

export const correlateIntent: IntentHandler = {
  matches(q) {
    return keywords.some((k) => q.includes(k));
  },
  handle({ catCol, numCol, sample, columns }): IntentResult {
    const otherCol = columns.find(
      (c) => c.name !== catCol && c.type === 'number'
    );
    const xCol = otherCol?.name || numCol;
    const data = sample.slice(0, 20).map((row) => ({
      name: String(row[catCol] || ''),
      value: Number(row[xCol]) || 0,
    }));
    const values = data.map((d) => d.value);
    const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
    const findings =
      `Relationship between **${catCol}** and **${xCol}**:\n\n` +
      `• ${data.length} paired observations\n` +
      `• Mean ${xCol}: **${formatNum(avg)}**\n` +
      `• Range: **${formatNum(Math.min(...values))}-${formatNum(Math.max(...values))}**\n\n` +
      `**Note**: with only ${data.length} points, any correlation is preliminary - load more data to confirm.`;
    return {
      chartType: 'scatter',
      title: `${catCol} vs ${xCol}`,
      data,
      findings,
    };
  },
};
