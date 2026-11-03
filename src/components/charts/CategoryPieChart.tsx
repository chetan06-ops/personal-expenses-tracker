import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CategoryBreakdownItem } from '../../types';
import { formatINR } from '../../utils/currency';

interface CategoryPieChartProps {
  data: CategoryBreakdownItem[];
  totalExpenses: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  totalExpenses,
}) => {
  if (data.length === 0 || totalExpenses === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3 border border-slate-700">
          ₹
        </div>
        <p className="text-sm font-medium text-slate-300">No Expense Data</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Record expense transactions to see your category breakdown.
        </p>
      </div>
    );
  }

  // Format data for Recharts (paise to rupees for chart value)
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount / 100,
    paise: item.amount,
    percentage: item.percentage,
    color: item.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 rounded-xl shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-semibold text-white">{item.name}</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 font-mono">
            {formatINR(item.paise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {item.percentage}% of total expenses
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="#0F172A"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-slate-300 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
