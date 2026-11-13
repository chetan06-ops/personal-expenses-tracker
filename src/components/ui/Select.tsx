import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full h-10 appearance-none rounded-xl bg-[#0D131F] border border-slate-700/80 pl-3.5 pr-9 text-sm text-slate-100',
              'focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/15 transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3"
            aria-hidden="true"
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
