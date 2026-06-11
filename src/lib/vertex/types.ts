export interface ColumnInfo {
  name: string;
  type: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface IntentInput {
  question: string;
  catCol: string;
  numCol: string;
  sample: Record<string, unknown>[];
  columns: ColumnInfo[];
}

export interface IntentResult {
  chartType: ChartType;
  title: string;
  data: Array<{ name: string; value: number }>;
  findings: string;
}

export interface IntentHandler {
  matches(q: string): boolean;
  handle(input: IntentInput): IntentResult;
}

export const DATA_LIMITS =
  'Based on sample data. Full dataset may show different patterns.';
