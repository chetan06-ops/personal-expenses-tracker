import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  compact = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        compact ? 'py-8' : 'py-12',
        className
      )}
    >
      <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-slate-400 mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
