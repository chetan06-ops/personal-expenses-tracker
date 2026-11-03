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
import { DailySpendingItem } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';

interface TrendAreaChartProps {
  data: DailySpendingItem[];
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-center p-4">
        <p className="text-sm font-medium text-slate-300">No Spending Trend Data</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Daily expense distribution will appear as you record transactions.
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    displayDate: formatDisplayDate(item.date),
    amount: item.amount / 100,
    paise: item.amount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl shadow-xl">
          <p className="text-[11px] text-slate-400 mb-0.5">{item.displayDate}</p>
          <div className="text-sm font-bold text-cyan-300 font-mono">
            {formatINR(item.paise)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            tickFormatter={(d) => d.split('-').slice(1).join('/')}
          />
          <YAxis
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#06B6D4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
