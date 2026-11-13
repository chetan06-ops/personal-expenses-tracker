import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity } from 'lucide-react';
import { DailySpendingItem } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { EmptyState } from '../ui/EmptyState';

interface TrendAreaChartProps {
  data: DailySpendingItem[];
}

function formatAxisINR(rupees: number): string {
  if (Math.abs(rupees) >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  if (Math.abs(rupees) >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  return `₹${rupees}`;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        compact
        icon={<Activity className="w-5 h-5" />}
        title="No Spending Trend Data"
        description="Daily expense distribution will appear as you record expense transactions."
        className="h-56"
      />
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    displayDate: formatDisplayDate(item.date),
    shortDate: formatDisplayDate(item.date).replace(/\s\d{4}$/, ''),
    amount: item.amount / 100,
    paise: item.amount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0D131F]/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-elevated">
          <p className="text-[11px] text-slate-400 mb-0.5">{item.displayDate}</p>
          <div className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
            {formatINR(item.paise)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
          <XAxis
            dataKey="shortDate"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.12)' }}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAxisINR}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendingGradient)"
            activeDot={{ r: 5, fill: '#06B6D4', stroke: '#070B12', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
