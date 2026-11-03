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
import { MonthlyTrendItem } from '../../types';
import { formatINR } from '../../utils/currency';

interface IncomeExpenseBarChartProps {
  data: MonthlyTrendItem[];
}

export const IncomeExpenseBarChart: React.FC<IncomeExpenseBarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-sm font-medium text-slate-300">No Monthly Trends Yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Add transactions across different months to compare cash inflows vs outflows.
        </p>
      </div>
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
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 rounded-xl shadow-xl min-w-[150px]">
          <p className="text-xs font-semibold text-slate-300 mb-2 border-b border-white/10 pb-1">
            {label}
          </p>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-emerald-400 font-medium">Income:</span>
            <span className="font-mono text-emerald-300">{formatINR(inc)}</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-rose-400 font-medium">Expenses:</span>
            <span className="font-mono text-rose-300">{formatINR(exp)}</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
            <span className="text-slate-400">Net:</span>
            <span
              className={`font-mono font-bold ${
                net >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
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
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={30}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium">{value}</span>
            )}
          />
          <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
