export interface ColumnInfo {
  name: string;
  type: string;
}

function pickNumberColumn(
  cols: ColumnInfo[],
  sample: Record<string, unknown>[]
): string {
  const typed = cols.find((c) => c.type === 'number')?.name;
  if (typed) return typed;
  if (sample[0]) {
    const fromRow = Object.keys(sample[0]).find(
      (k) => typeof sample[0][k] === 'number'
    );
    if (fromRow) return fromRow;
  }
  return cols[1]?.name || 'value';
}

function pickCategoryColumn(
  cols: ColumnInfo[],
  _sample: Record<string, unknown>[]
): string {
  const text = cols.find((c) => c.type === 'string')?.name;
  if (text) return text;
  return cols[0]?.name || 'category';
}

function aggregate(
  sample: Record<string, unknown>[],
  keyCol: string,
  valCol: string
): Array<{ name: string; value: number }> {
  const agg: Record<string, number> = {};
  for (const row of sample) {
    const key = String(row[keyCol] || 'Unknown');
    const val = Number(row[valCol]) || 0;
    agg[key] = (agg[key] || 0) + val;
  }
  return Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

function formatNum(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

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
  const limitations =
    'Based on sample data. Full dataset may show different patterns.';

  const introPatterns = [
    /^(who are you|what are you|what is this|what's this|what can you do|help|hi|hello|hey|yo|sup)\b/,
    /^(introduce yourself|about you|about this)/,
  ];
  if (introPatterns.some((re) => re.test(q))) {
    return {
      chartConfig: {
        type: 'bar' as const,
        title: 'DataLensAI — at a glance',
        xAxis: 'capability',
        yAxis: 'coverage',
        data: [
          { name: 'CSV / JSON / Excel parsing', value: 100 },
          { name: 'Natural-language Q&A', value: 95 },
          { name: 'Auto chart selection', value: 90 },
          { name: 'Limitations surfaced', value: 100 },
        ],
      },
      findings:
        "I'm DataLensAI — your autonomous data analysis partner. Upload any data file and ask questions in plain English. I surface the right visualization, synthesize findings, and flag limitations honestly. No SQL, no Python — just answers.\n\n**Try asking me**:\n• Show me the top performers\n• Plot a trend over time\n• Break down by category",
      limitations:
        'Demo mode: responses are generated from your data shape. For richer AI insights, enable Vertex AI.',
      suggestions: [
        'Show me the top performers',
        'Plot a trend over time',
        'Break down by category',
      ],
      stats: { totalRows, matchingRows: sample.length },
    };
  }

  let chartType: 'bar' | 'line' | 'pie' | 'scatter' = 'bar';
  let title = 'Analysis Results'; // eslint-disable-line no-useless-assignment
  let data: Array<{ name: string; value: number }> = []; // eslint-disable-line no-useless-assignment
  let findings = ''; // eslint-disable-line no-useless-assignment

  if (sample.length > 0 && cols.length > 0) {
    const catCol = pickCategoryColumn(cols, sample);
    const numCol = pickNumberColumn(cols, sample);

    if (
      q.includes('top') ||
      q.includes('highest') ||
      q.includes('best') ||
      q.includes('leader') ||
      q.includes('most')
    ) {
      const agg = aggregate(sample, catCol, numCol).slice(0, 8);
      data = agg;
      title = `Top ${catCol} by ${numCol}`;
      const top3 = agg.slice(0, 3).reduce((s, d) => s + d.value, 0);
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      const topPer = top3 / total;
      const lead = agg[0]?.name || 'N/A';
      findings =
        `Here's how ${catCol} ranks by ${numCol}:\n\n` +
        `The leader is **${lead}** at ${formatNum(agg[0]?.value || 0)}, ` +
        `accounting for ${formatPct((agg[0]?.value || 0) / total)} of all ${numCol}.\n\n` +
        `Top 3 breakdown:\n` +
        agg
          .slice(0, 3)
          .map((d) => `• **${d.name}** — ${formatNum(d.value)}`)
          .join('\n') +
        `\n\nTotal ${numCol} across all groups: **${formatNum(total)}**.\n\n` +
        `**Recommendation**: double down on the leader's pattern — it contributes ${formatPct(topPer)} of the top 3.`;
    } else if (
      q.includes('improve') ||
      q.includes('forecast') ||
      q.includes('predict') ||
      q.includes('next year') ||
      q.includes('next quarter') ||
      q.includes('next month') ||
      q.includes('projection') ||
      q.includes('future')
    ) {
      chartType = 'line';
      const agg = aggregate(sample, catCol, numCol);
      const tail = agg.slice(-8);
      const values = tail.map((d) => d.value);
      data = values.map((v, i) => ({
        name: tail[i]?.name || `P${i + 1}`,
        value: v,
      }));
      title = `Growth potential — ${catCol} vs ${numCol}`;
      const sorted = [...agg].sort((a, b) => a.value - b.value);
      const weakest = sorted.slice(0, 3);
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      const potential = weakest.reduce((s, d) => s + (avg - d.value), 0);
      findings =
        `Growth opportunities I see:\n\n` +
        `The lowest performers are **${weakest.map((d) => d.name).join(', ')}** — ` +
        `these are your biggest improvement targets.\n\n` +
        `• Current average ${numCol}: **${formatNum(avg)}**\n` +
        `• Potential lift: **+${formatNum(potential)}** if bottom reach average\n` +
        `• These 3 groups are dragging the dataset down by **${formatNum(sorted[0]?.value || 0)}** below the mean\n\n` +
        `**Action**: replicate what's working in the top groups, then apply to the bottom 3.`;
    } else if (
      q.includes('trend') ||
      q.includes('over time') ||
      q.includes('growth') ||
      q.includes('month') ||
      q.includes('week') ||
      q.includes('daily') ||
      q.includes('timeline')
    ) {
      chartType = 'line';
      const agg = aggregate(sample, catCol, numCol);
      const tail = agg.slice(0, 10);
      data = tail.map((d) => ({ name: d.name, value: d.value }));
      title = `${numCol} trend across ${catCol}`;
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
      findings =
        `**${numCol} is trending ${direction}** across the period.\n\n` +
        `• Range: **${formatNum(min)} → ${formatNum(max)}** (swing of ${formatNum(swing)})\n` +
        `• Average: **${formatNum(avg)}**\n` +
        `• Showing ${values.length} data points across ${catCol}\n\n` +
        `**Takeaway**: the ${direction} trend suggests ${
          direction === 'upward'
            ? 'positive momentum — keep doing what works'
            : 'a need to investigate what is slowing the curve'
        }.`;
    } else if (
      q.includes('distribut') ||
      q.includes('breakdown') ||
      q.includes('split') ||
      q.includes('share') ||
      q.includes('proportion') ||
      q.includes('pie')
    ) {
      chartType = 'pie';
      const agg = aggregate(sample, catCol, numCol).slice(0, 6);
      data = agg;
      title = `${catCol} distribution`;
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      findings =
        `Here's how ${catCol} breaks down:\n\n` +
        agg
          .slice(0, 4)
          .map(
            (d) =>
              `• **${d.name}** — ${formatPct(d.value / total)} (${formatNum(d.value)})`
          )
          .join('\n') +
        `\n\nTotal across all groups: **${formatNum(total)}**.\n\n` +
        `**Insight**: ${
          agg[0]
            ? `${agg[0].name} dominates with ${formatPct((agg[0].value || 0) / total)}`
            : 'The distribution is fairly even'
        }.`;
    } else if (
      q.includes('correlat') ||
      q.includes('relationship') ||
      q.includes('vs ') ||
      q.includes('versus')
    ) {
      chartType = 'scatter';
      const otherCol = cols.find(
        (c) => c.name !== catCol && c.type === 'number'
      );
      const xCol = otherCol?.name || numCol;
      data = sample.slice(0, 20).map((row) => ({
        name: String(row[catCol] || ''),
        value: Number(row[xCol]) || 0,
      }));
      title = `${catCol} vs ${xCol}`;
      const values = data.map((d) => d.value);
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      findings =
        `Relationship between **${catCol}** and **${xCol}**:\n\n` +
        `• ${data.length} paired observations\n` +
        `• Mean ${xCol}: **${formatNum(avg)}**\n` +
        `• Range: **${formatNum(Math.min(...values))}–${formatNum(Math.max(...values))}**\n\n` +
        `**Note**: with only ${data.length} points, any correlation is preliminary — load more data to confirm.`;
    } else if (
      q.includes('average') ||
      q.includes('mean') ||
      q.includes('total') ||
      q.includes('sum')
    ) {
      const agg = aggregate(sample, catCol, numCol);
      data = agg.slice(0, 8);
      title = `${numCol} totals by ${catCol}`;
      const total = agg.reduce((s, d) => s + d.value, 0);
      const avg = total / (agg.length || 1);
      findings =
        `Here's the aggregate view:\n\n` +
        `• **Total ${numCol}**: ${formatNum(total)}\n` +
        `• **Average per ${catCol}**: ${formatNum(avg)}\n` +
        `• **Groups in dataset**: ${agg.length}\n\n` +
        `**Sanity check**: ${total > 0 ? `the data shows real signal` : `the data sums to 0 — check your input`}.`;
    } else if (
      q.includes('how') ||
      q.includes('why') ||
      q.includes('explain') ||
      q.includes('describe') ||
      q.includes('what is') ||
      q.includes('tell me') ||
      q.includes('fast') ||
      q.includes('quick') ||
      q.includes('detail') ||
      q.includes('more')
    ) {
      const agg = aggregate(sample, catCol, numCol);
      data = agg.slice(0, 6);
      title = `${catCol} — ${numCol}`;
      const total = agg.reduce((s, d) => s + d.value, 0);
      const avg = total / (agg.length || 1);
      const range = [...agg].sort((a, b) => b.value - a.value);
      findings =
        `You asked: **"${question.trim()}"**\n\n` +
        `Here's what I see in your data:\n\n` +
        `• **${agg.length}** ${catCol} groups, totaling **${formatNum(total)}** ${numCol}\n` +
        `• **Average per group**: ${formatNum(avg)}\n` +
        `• **Top performer**: ${range[0]?.name || 'N/A'} with **${formatNum(range[0]?.value || 0)}**\n` +
        `• **${sample.length}** rows processed in this sample\n\n` +
        `**Want to go deeper?** Try a follow-up like "which group has the highest variance?" or "break down the top performer".`;
    } else {
      const agg = aggregate(sample, catCol, numCol).slice(0, 8);
      data = agg;
      title = `${catCol} vs ${numCol}`;
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      findings =
        `Got it — here's my read on **"${question.trim()}"**:\n\n` +
        `• **${agg.length}** ${catCol} groups found\n` +
        `• **Total ${numCol}**: ${formatNum(total)}\n` +
        `• **Top**: ${agg[0]?.name || 'N/A'} leads with **${formatNum(agg[0]?.value || 0)}**\n\n` +
        `Ask a follow-up to drill into any specific group.`;
    }
  } else {
    data = [
      { name: 'Sample A', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample B', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample C', value: Math.floor(Math.random() * 5000) + 1000 },
    ];
    title = 'Sample Analysis';
    findings = `Upload data to see real analysis — currently showing placeholder values.`;
  }

  return {
    chartConfig: {
      type: chartType,
      title,
      xAxis: cols[0]?.name || 'category',
      yAxis: cols.find((c) => c.type === 'number')?.name || 'value',
      data,
    },
    findings,
    limitations,
    suggestions: [
      'Show me the top performers',
      'Plot a trend over time',
      'Break down by category',
    ],
    stats: { totalRows, matchingRows: sample.length },
  };
}
