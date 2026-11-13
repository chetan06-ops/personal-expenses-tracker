import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { CategoryBreakdownItem } from '../../types';
import { formatINR } from '../../utils/currency';
import { EmptyState } from '../ui/EmptyState';

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
      <EmptyState
        compact
        icon={<PieChartIcon className="w-5 h-5" />}
        title="No Expense Data"
        description="Record expense transactions to visualize your categorical breakdown."
        className="h-60"
      />
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount / 100,
    paise: item.amount,
    percentage: item.percentage,
    color: item.color,
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#0D131F]/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-elevated">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-semibold text-white">{item.name}</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
            {formatINR(item.paise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
            {item.percentage}% of spend • {item.count} tx
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2.5}
            dataKey="value"
            stroke="#0D131F"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Total Spend
        </span>
        <span className="text-sm font-bold font-mono text-white tabular-nums mt-0.5">
          {formatINR(totalExpenses, { compact: totalExpenses >= 10000000 })}
        </span>
      </div>
    </div>
  );
};
