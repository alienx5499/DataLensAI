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
        title: 'DataLensAI at a glance',
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
        "I'm DataLensAI — an autonomous data analysis agent. Upload a CSV, JSON, or Excel file and ask plain-English questions. I'll pick the right chart, summarize the findings, and flag what the data can't tell us.",
      limitations:
        'No live AI in demo mode; responses are template-driven from your data shape.',
      suggestions: [
        'Show me the top 5 rows',
        'What columns are in this dataset?',
        'Plot a trend over time',
        'Break down the data by category',
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
      q.includes('most') ||
      q.includes('leader')
    ) {
      const agg = aggregate(sample, catCol, numCol).slice(0, 8);
      data = agg;
      title = `Top ${catCol} by ${numCol}`;
      const top3 = agg.slice(0, 3).reduce((s, d) => s + d.value, 0);
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      findings = `Top 3 ${catCol} contribute ${Math.round((top3 / total) * 100)}% of total ${numCol}. Leader: ${agg[0]?.name || 'N/A'} with ${agg[0]?.value.toLocaleString() || 0}.`;
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
      title = `Forecast candidates — ${catCol} vs ${numCol}`;
      const sorted = [...agg].sort((a, b) => a.value - b.value);
      const weakest = sorted.slice(0, 3);
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      findings = `Lowest ${catCol} (best improvement targets): ${weakest.map((d) => `${d.name} (${d.value.toLocaleString()})`).join(', ')}. Current average ${numCol}: ${avg.toFixed(0)}. Lifting the bottom 3 toward the mean would add ~${weakest.reduce((s, d) => s + (avg - d.value), 0).toFixed(0)} ${numCol}.`;
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
      const trend =
        values.length > 1 && values[values.length - 1] > values[0]
          ? 'increasing'
          : 'flat or decreasing';
      findings = `${numCol} is ${trend} across the period. Range: ${Math.min(...values).toFixed(0)} to ${Math.max(...values).toFixed(0)}. Average: ${avg.toFixed(0)}.`;
    } else if (
      q.includes('distribut') ||
      q.includes('breakdown') ||
      q.includes('split') ||
      q.includes('share') ||
      q.includes('proportion')
    ) {
      chartType = 'pie';
      const agg = aggregate(sample, catCol, numCol).slice(0, 6);
      data = agg;
      title = `${catCol} distribution`;
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      findings = `${catCol} split: ${agg
        .map((d) => `${d.name} ${Math.round((d.value / total) * 100)}%`)
        .join(', ')}.`;
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
      findings = `Scatter of ${data.length} points across ${catCol}. Mean ${xCol}: ${avg.toFixed(0)}. Range: ${Math.min(...values).toFixed(0)}–${Math.max(...values).toFixed(0)}.`;
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
      findings = `Across ${agg.length} ${catCol} groups: total ${numCol} ${total.toFixed(0)}, average ${avg.toFixed(0)} per ${catCol}.`;
    } else {
      const agg = aggregate(sample, catCol, numCol).slice(0, 8);
      data = agg;
      title = `${catCol} vs ${numCol}`;
      const total = agg.reduce((s, d) => s + d.value, 0) || 1;
      findings = `Answer to "${question.trim()}": ${agg.length} ${catCol} groups observed. Total ${numCol} ${total.toFixed(0)}; average per ${catCol} ${(total / agg.length).toFixed(0)}. Top group: ${agg[0]?.name || 'N/A'}.`;
    }
  } else {
    data = [
      { name: 'Sample A', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample B', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample C', value: Math.floor(Math.random() * 5000) + 1000 },
    ];
    title = 'Sample Analysis';
    findings = `Answer to "${question.trim()}": no data uploaded yet — showing placeholder series.`;
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
      'Which groups could improve the most?',
      'Plot the trend over time',
    ],
    stats: { totalRows, matchingRows: sample.length },
  };
}
