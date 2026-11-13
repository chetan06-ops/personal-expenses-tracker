import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: 'cyan' | 'violet' | 'emerald' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, glow = 'none', children, ...props }, ref) => {
    const glowClasses = {
      cyan: 'hover:border-cyan-500/35 hover:shadow-glow-cyan',
      violet: 'hover:border-violet-500/35 hover:shadow-glow-violet',
      emerald: 'hover:border-emerald-500/35 hover:shadow-glow-emerald',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fintech-surface rounded-2xl p-5 text-slate-100 relative overflow-hidden',
          hoverEffect && 'glass-card-hover',
          glowClasses[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-white/[0.06]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-sm sm:text-base font-semibold tracking-tight text-slate-100', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 mt-0.5 leading-relaxed', className)} {...props}>
    {children}
  </p>
);
