import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { MonthlyTrendItem } from '../../types';
import { formatINR } from '../../utils/currency';
import { EmptyState } from '../ui/EmptyState';

interface IncomeExpenseBarChartProps {
  data: MonthlyTrendItem[];
}

function formatAxisINR(rupees: number): string {
  if (Math.abs(rupees) >= 100000) {
    return `₹${(rupees / 100000).toFixed(1)}L`;
  }
  if (Math.abs(rupees) >= 1000) {
    return `₹${(rupees / 1000).toFixed(0)}k`;
  }
  return `₹${rupees}`;
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <EmptyState
        compact
        icon={<BarChart3 className="w-5 h-5" />}
        title="No Monthly Trends Yet"
        description="Add transactions across months to compare cash inflows vs. outflows."
        className="h-64"
      />
    );
  }

  const chartData = data.map((item) => ({
    month: item.month,
    Income: item.income / 100,
    Expenses: item.expenses / 100,
    incomePaise: item.income,
    expensesPaise: item.expenses,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const inc = payload.find((p: any) => p.dataKey === 'Income')?.payload.incomePaise || 0;
      const exp = payload.find((p: any) => p.dataKey === 'Expenses')?.payload.expensesPaise || 0;
      const net = inc - exp;

      return (
        <div className="bg-[#0D131F]/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-elevated min-w-[175px]">
          <p className="text-xs font-semibold text-slate-200 mb-2 border-b border-white/[0.06] pb-1.5">
            {label}
          </p>
          <div className="flex items-center justify-between gap-4 text-xs mb-1">
            <span className="text-emerald-400 font-medium">Income</span>
            <span className="font-mono text-emerald-300 tabular-nums">{formatINR(inc)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs mb-1.5">
            <span className="text-rose-400 font-medium">Expenses</span>
            <span className="font-mono text-rose-300 tabular-nums">{formatINR(exp)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs pt-1.5 border-t border-white/[0.06]">
            <span className="text-slate-400 font-medium">Net Flow</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                net >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {net >= 0 ? '+' : ''}
              {formatINR(net)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" vertical={false} />
          <XAxis
            dataKey="month"
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
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
          />
          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium ml-1">{value}</span>
            )}
          />
          <Bar dataKey="Income" fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={36} />
          <Bar dataKey="Expenses" fill="#F43F5E" radius={[5, 5, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
