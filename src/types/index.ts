export type ColumnType = 'string' | 'number' | 'date' | 'boolean' | 'mixed';

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPercent: number;
  uniqueCount: number;
  sampleValues: string[];
  min?: number;
  max?: number;
  mean?: number;
  topValues: { value: string; count: number }[];
}

export interface DataProfile {
  id: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  columns: ColumnInfo[];
  uploadedAt: number;
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'scatter'
  | 'pie'
  | 'heatmap'
  | 'distribution';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxis?: string;
  yAxis?: string;
  data: Array<Record<string, string | number>>;
  caption?: string;
}

export interface AnalysisResult {
  chartConfig: ChartConfig | null;
  findings: string;
  limitations: string;
  stats: Record<string, number>;
  suggestions?: string[];
}

export interface AnalysisEntry extends AnalysisResult {
  id: string;
  question: string;
  timestamp: number;
}

export interface AnalysisSession {
  id: string;
  fileName: string;
  profile: DataProfile;
  entries: AnalysisEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: AnalysisResult;
  isStreaming?: boolean;
  timestamp: number;
}
