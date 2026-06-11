'use client';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  TooltipProps,
} from 'recharts';
import { EMERALD, EMERALD_DARK, PALETTE } from '@/lib/theme';

type ChartDatum = Record<string, string | number>;

const tooltipStyle: TooltipProps<string, string>['contentStyle'] = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  backdropFilter: 'blur(12px)',
  color: '#F8FAFC',
  fontSize: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

export const BarChartView: React.FC<{ data: ChartDatum[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
      <defs>
        <linearGradient id="emeraldBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity={1} />
          <stop offset="100%" stopColor={EMERALD_DARK} stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="currentColor"
        className="text-border"
        opacity={0.3}
        vertical={false}
      />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
        contentStyle={tooltipStyle}
      />
      <Bar
        dataKey="value"
        fill="url(#emeraldBar)"
        radius={[6, 6, 0, 0]}
        animationDuration={800}
      />
    </BarChart>
  </ResponsiveContainer>
);

export const LineChartView: React.FC<{ data: ChartDatum[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
      <defs>
        <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity={0.3} />
          <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="currentColor"
        className="text-border"
        opacity={0.3}
        vertical={false}
      />
      <XAxis
        dataKey="name"
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <Tooltip contentStyle={tooltipStyle} />
      <Area
        type="monotone"
        dataKey="value"
        stroke={EMERALD}
        strokeWidth={2}
        fill="url(#emeraldArea)"
        animationDuration={800}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const PieChartView: React.FC<{ data: ChartDatum[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={110}
        paddingAngle={2}
        label={true}
        labelLine={false}
        animationDuration={800}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
        ))}
      </Pie>
      <Tooltip contentStyle={tooltipStyle} />
    </PieChart>
  </ResponsiveContainer>
);

export const ScatterChartView: React.FC<{ data: ChartDatum[] }> = ({
  data,
}) => (
  <ResponsiveContainer width="100%" height={320}>
    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="currentColor"
        className="text-border"
        opacity={0.3}
      />
      <XAxis
        dataKey="name"
        type="category"
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <YAxis
        dataKey="value"
        type="number"
        tick={{ fontSize: 11 }}
        className="text-muted-foreground"
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        contentStyle={tooltipStyle}
      />
      <Scatter data={data} fill={EMERALD} animationDuration={800} />
    </ScatterChart>
  </ResponsiveContainer>
);
