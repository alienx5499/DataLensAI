import type { ColumnInfo } from './types';

export interface ChartDatum {
  name: string;
  value: number;
}

export function pickNumberColumn(
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

export function pickCategoryColumn(
  cols: ColumnInfo[],
  _sample: Record<string, unknown>[]
): string {
  const text = cols.find((c) => c.type === 'string')?.name;
  if (text) return text;
  return cols[0]?.name || 'category';
}

export function aggregate(
  sample: Record<string, unknown>[],
  keyCol: string,
  valCol: string
): ChartDatum[] {
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

export function formatNum(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
