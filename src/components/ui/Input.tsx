import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftAddon, rightAddon, onClear, id, value, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
    const showClear = Boolean(onClear && value !== undefined && String(value).length > 0);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftAddon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            value={value}
            aria-invalid={error ? true : undefined}
            className={cn(
              'w-full h-10 rounded-xl bg-[#0D131F] border border-slate-700/80 px-3.5 text-sm text-slate-100 placeholder-slate-500',
              'focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/15 transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftAddon && 'pl-9',
              (rightAddon || showClear) && 'pr-9',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {showClear ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear input"
              className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : rightAddon ? (
            <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
              {rightAddon}
            </div>
          ) : null}
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

Input.displayName = 'Input';
