import { useState, useCallback, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let toastsState: ToastMessage[] = [];

function notify() {
  toastListeners.forEach((l) => l([...toastsState]));
}

export function showToast(message: Omit<ToastMessage, 'id'>): void {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newToast: ToastMessage = { ...message, id };
  toastsState = [newToast, ...toastsState].slice(0, 5); // Keep max 5 toasts
  notify();

  const duration = message.duration || 4000;
  setTimeout(() => {
    dismissToast(id);
  }, duration);
}

export function dismissToast(id: string): void {
  toastsState = toastsState.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastsState);

  const subscribe = useCallback((newToasts: ToastMessage[]) => {
    setToasts(newToasts);
  }, []);

  useEffect(() => {
    toastListeners.push(subscribe);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== subscribe);
    };
  }, [subscribe]);

  return {
    toasts,
    toast: showToast,
    dismiss: dismissToast,
  };
}
