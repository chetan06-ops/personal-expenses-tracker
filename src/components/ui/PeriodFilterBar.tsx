import React from 'react';
import { Calendar } from 'lucide-react';
import { FilterPeriod } from '../../types';
import { cn } from '../../utils/cn';

interface PeriodOption {
  id: FilterPeriod;
  label: string;
}

const DEFAULT_PERIODS: PeriodOption[] = [
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
];

interface PeriodFilterBarProps {
  period: FilterPeriod;
  onPeriodChange: (period: FilterPeriod) => void;
  customStart?: string;
  customEnd?: string;
  onCustomStartChange?: (value: string) => void;
  onCustomEndChange?: (value: string) => void;
  rightSlot?: React.ReactNode;
  periods?: PeriodOption[];
  className?: string;
}

export const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({
  period,
  onPeriodChange,
  customStart = '',
  customEnd = '',
  onCustomStartChange,
  onCustomEndChange,
  rightSlot,
  periods = DEFAULT_PERIODS,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 fintech-surface rounded-2xl p-3 sm:px-4 sm:py-3',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 shrink-0 mr-1.5 pl-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span className="hidden sm:inline">Period</span>
          </span>
          {periods.map((p) => {
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodChange(p.id)}
                aria-pressed={isActive}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {rightSlot && <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>}
      </div>

      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-medium">Custom Range:</span>
          <label className="sr-only" htmlFor="period-custom-start">
            Start Date
          </label>
          <input
            id="period-custom-start"
            type="date"
            value={customStart}
            max={customEnd || undefined}
            onChange={(e) => onCustomStartChange?.(e.target.value)}
            className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          />
          <span className="text-slate-500">to</span>
          <label className="sr-only" htmlFor="period-custom-end">
            End Date
          </label>
          <input
            id="period-custom-end"
            type="date"
            value={customEnd}
            min={customStart || undefined}
            onChange={(e) => onCustomEndChange?.(e.target.value)}
            className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}
    </div>
  );
};
