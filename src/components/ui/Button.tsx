import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B12] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap';

    const variants = {
      primary:
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-sm shadow-cyan-500/20 focus-visible:ring-cyan-400 border border-cyan-400/50',
      secondary:
        'bg-slate-800 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 focus-visible:ring-slate-400',
      outline:
        'border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-slate-200 hover:text-cyan-200 focus-visible:ring-cyan-400',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20 border border-rose-500/40 focus-visible:ring-rose-400',
      ghost:
        'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 focus-visible:ring-slate-400',
      glass:
        'bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/40 hover:bg-slate-800/90 text-slate-100 focus-visible:ring-cyan-400',
    };

    const sizes = {
      sm: 'text-xs px-3 h-8 gap-1.5',
      md: 'text-sm px-4 h-10 gap-2',
      lg: 'text-base px-5 h-11 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
