export interface ColumnInfo {
  name: string;
  type: string;
}

export function generateMock(
  question: string,
  profile: unknown,
  dataSample: unknown[]
) {
  const q = question.toLowerCase();
  const p = profile as { totalRows?: number; columns?: ColumnInfo[] };
  const cols = p?.columns || [];
  const sample = (dataSample as Record<string, unknown>[]) || [];
  const totalRows = p?.totalRows || sample.length || 12;

  let chartType = 'bar';
  let title = 'Analysis Results'; // eslint-disable-line no-useless-assignment
  let data: Array<{ name: string; value: number }> = []; // eslint-disable-line no-useless-assignment
  let findings = ''; // eslint-disable-line no-useless-assignment
  const limitations =
    'Based on sample data. Full dataset may show different patterns.';

  if (sample.length > 0 && cols.length > 0) {
    const firstCol = cols[0].name;
    const valueCol =
      cols.find((c) => c.type === 'number')?.name ||
      Object.keys(sample[0]).find((k) => typeof sample[0][k] === 'number') ||
      Object.keys(sample[0])[1];

    if (
      q.includes('top') ||
      q.includes('highest') ||
      q.includes('best') ||
      q.includes('most')
    ) {
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Unknown');
        const val = Number(row[valueCol]) || 0;
        agg[key] = (agg[key] || 0) + val;
      }
      data = Object.entries(agg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
      title = `Top ${firstCol} by ${valueCol}`;
      const top3Sum = data.slice(0, 3).reduce((s, d) => s + d.value, 0);
      const totalSum = data.reduce((s, d) => s + d.value, 0) || 1;
      findings = `Top 3 ${firstCol} contribute ${Math.round((top3Sum / totalSum) * 100)}% of total ${valueCol}. Leader: ${data[0]?.name || 'N/A'}.`;
    } else if (
      q.includes('trend') ||
      q.includes('over time') ||
      q.includes('growth') ||
      q.includes('month')
    ) {
      chartType = 'line';
      const values = sample
        .slice(0, 10)
        .map((row) => Number(row[valueCol]) || 0);
      data = values.map((v, i) => ({ name: `P${i + 1}`, value: v }));
      title = `${valueCol} Over Time`;
      const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);
      const trend =
        values.length > 1 && values[values.length - 1] > values[0]
          ? 'increasing'
          : 'decreasing';
      findings = `${valueCol} ${trend}. Range: ${Math.min(...values).toFixed(0)} to ${Math.max(...values).toFixed(0)}. Average: ${avg.toFixed(0)}.`;
    } else if (
      q.includes('distribut') ||
      q.includes('breakdown') ||
      q.includes('split')
    ) {
      chartType = 'pie';
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Unknown');
        const val = Number(row[valueCol]) || 0;
        agg[key] = (agg[key] || 0) + val;
      }
      data = Object.entries(agg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));
      title = `${firstCol} Distribution`;
      findings = `${firstCol} breakdown: ${data.map((d) => `${d.name} (${d.value})`).join(', ')}.`;
    } else {
      const agg: Record<string, number> = {};
      for (const row of sample) {
        const key = String(row[firstCol] || 'Unknown');
        const val = Number(row[valueCol]) || 0;
        agg[key] = (agg[key] || 0) + val;
      }
      data = Object.entries(agg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
      title = `${firstCol} vs ${valueCol}`;
      const total = data.reduce((s, d) => s + d.value, 0) || 1;
      findings = `${data.length} ${firstCol} categories. Total ${valueCol}: ${total.toFixed(0)}. Average per ${firstCol}: ${(total / data.length).toFixed(0)}.`;
    }
  } else {
    data = [
      { name: 'Sample A', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample B', value: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Sample C', value: Math.floor(Math.random() * 5000) + 1000 },
    ];
    title = 'Sample Analysis';
    findings =
      'Generated from sample data. Upload your dataset for real insights.';
  }

  return {
    chartConfig: {
      type: chartType as 'bar',
      title,
      xAxis: cols[0]?.name || 'category',
      yAxis: cols.find((c) => c.type === 'number')?.name || 'value',
      data,
    },
    findings,
    limitations,
    stats: {
      totalRows,
      matchingRows: sample.length,
    },
    suggestions: [
      'Analyze sales trends over different time periods',
      'Compare performance across different segments',
      'Investigate factors behind top performers',
    ],
  };
}
