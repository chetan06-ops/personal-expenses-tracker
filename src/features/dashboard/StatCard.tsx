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
  variant?: 'cyan' | 'emerald' | 'rose' | 'violet' | 'amber';
  isCurrency?: boolean;
  valueSuffix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amountPaise,
  subtitle,
  icon,
  trend,
  variant = 'cyan',
  isCurrency = true,
  valueSuffix,
}) => {
  const borderColors = {
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400',
    rose: 'border-rose-500/20 hover:border-rose-500/40 text-rose-400',
    violet: 'border-violet-500/20 hover:border-violet-500/40 text-violet-400',
    amber: 'border-amber-500/20 hover:border-amber-500/40 text-amber-400',
  };

  const glowBg = {
    cyan: 'bg-cyan-500/10',
    emerald: 'bg-emerald-500/10',
    rose: 'bg-rose-500/10',
    violet: 'bg-violet-500/10',
    amber: 'bg-amber-500/10',
  };

  return (
    <Card className={cn('transition-all duration-200 border', borderColors[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              {isCurrency ? formatINR(amountPaise) : amountPaise}
              {valueSuffix && <span className="text-sm font-sans ml-1 text-slate-400">{valueSuffix}</span>}
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              {trend && <span className="font-semibold text-cyan-300">{trend}</span>}
              <span>{subtitle}</span>
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl border border-white/5', glowBg[variant])}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
