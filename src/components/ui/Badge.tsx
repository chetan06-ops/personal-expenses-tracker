import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const dotColors = {
    cyan: 'bg-cyan-400',
    violet: 'bg-violet-400',
    emerald: 'bg-emerald-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    slate: 'bg-slate-400',
    outline: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none tabular-nums whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
};
