import {
  BarChartView,
  LineChartView,
  PieChartView,
  ScatterChartView,
} from '@/components/chart/views';
import type { ChartConfig } from '@/types';

type ChartData = NonNullable<ChartConfig['data']>;

export const CHART_VIEWS: Record<string, React.FC<{ data: ChartData }>> = {
  bar: BarChartView,
  distribution: BarChartView,
  heatmap: BarChartView,
  line: LineChartView,
  pie: PieChartView,
  scatter: ScatterChartView,
};
