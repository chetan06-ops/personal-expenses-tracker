import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: 'cyan' | 'violet' | 'emerald' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, glow = 'none', children, ...props }, ref) => {
    const glowClasses = {
      cyan: 'hover:border-cyan-500/40 hover:shadow-glow-cyan',
      violet: 'hover:border-violet-500/40 hover:shadow-glow-violet',
      emerald: 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
      none: '',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-2xl p-5 text-slate-100 shadow-glass border border-white/5 relative overflow-hidden',
          hoverEffect && 'glass-card-hover cursor-pointer',
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
  <div className={cn('flex items-center justify-between pb-3 mb-2 border-b border-white/5', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold tracking-tight text-slate-100', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);
