import React from 'react';
import { useToast } from '../../hooks/useToast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />,
  };

  const borderColors = {
    success: 'border-emerald-500/35',
    error: 'border-rose-500/35',
    warning: 'border-amber-500/35',
    info: 'border-cyan-500/35',
  };

  return (
    <div
      className="fixed bottom-20 lg:bottom-5 right-4 sm:right-5 left-4 sm:left-auto z-50 flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-[#0F172A]/95 backdrop-blur-md border shadow-elevated transition-all duration-200 ${borderColors[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-slate-300 mt-0.5 break-words leading-relaxed">
                {toast.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
