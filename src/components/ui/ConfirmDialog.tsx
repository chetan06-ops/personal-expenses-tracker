import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2.5 rounded-xl shrink-0 border',
              isDanger
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            )}
          >
            {isDanger ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
