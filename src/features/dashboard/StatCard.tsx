import React from 'react';
import { Card } from '../../components/ui/Card';
import { formatINR } from '../../utils/currency';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  amountPaise: number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendTone?: 'positive' | 'negative' | 'neutral';
  variant?: 'cyan' | 'emerald' | 'rose' | 'violet' | 'amber';
  isCurrency?: boolean;
  valueSuffix?: string;
  progressPercent?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amountPaise,
  subtitle,
  icon,
  trend,
  trendTone = 'neutral',
  variant = 'cyan',
  isCurrency = true,
  valueSuffix,
  progressPercent,
}) => {
  const accentBorders = {
    cyan: 'hover:border-cyan-500/35',
    emerald: 'hover:border-emerald-500/35',
    rose: 'hover:border-rose-500/35',
    violet: 'hover:border-violet-500/35',
    amber: 'hover:border-amber-500/35',
  };

  const iconContainers = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  const trendClasses = {
    positive: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    negative: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    neutral: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
  };

  const barColors = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    violet: 'bg-violet-400',
    amber: 'bg-amber-400',
  };

  return (
    <Card className={cn('p-4 sm:p-5 transition-colors duration-200', accentBorders[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {isCurrency ? formatINR(amountPaise) : amountPaise}
              {valueSuffix && (
                <span className="text-sm font-sans font-semibold ml-0.5 text-slate-300">
                  {valueSuffix}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className={cn('p-2.5 rounded-xl border shrink-0', iconContainers[variant])}>
          {icon}
        </div>
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColors[variant])}
            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
          />
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px]">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full border font-mono text-[10px] font-semibold shrink-0 tabular-nums',
                trendClasses[trendTone]
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
