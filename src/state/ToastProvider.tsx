import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";

export type ToastTone = "success" | "info" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  showToast: (message: string, tone?: ToastTone, action?: Toast["action"]) => void;
  hideToast: () => void;
  /** Fare üstündeyken ya da odak içindeyken süre durur; ayrılınca yeniden başlar. */
  pauseToast: () => void;
  resumeToast: () => void;
}

const AUTO_HIDE_MS = 6000;
/** Eylemli snackbar ("Geri al") okunup basılabilsin diye daha uzun kalır. */
const ACTION_HIDE_MS = 10000;
const ToastApiContext = createContext<ToastApi | null>(null);
const ToastValueContext = createContext<Toast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const hideToast = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast(null);
  }, []);

  const delay = useRef(AUTO_HIDE_MS);
  const showToast = useCallback<ToastApi["showToast"]>((message, tone = "success", action) => {
    window.clearTimeout(timer.current);
    setToast({ id: ++seq.current, message, tone, action });
    delay.current = action ? ACTION_HIDE_MS : AUTO_HIDE_MS;
    timer.current = window.setTimeout(() => setToast(null), delay.current);
  }, []);

  const pauseToast = useCallback(() => window.clearTimeout(timer.current), []);
  const resumeToast = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), delay.current);
  }, []);

  const api = useMemo(() => ({ showToast, hideToast, pauseToast, resumeToast }), [showToast, hideToast, pauseToast, resumeToast]);
  return (
    <ToastApiContext value={api}>
      <ToastValueContext value={toast}>{children}</ToastValueContext>
    </ToastApiContext>
  );
}

export function useToast(): ToastApi {
  const api = use(ToastApiContext);
  if (!api) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return api;
}

export const useCurrentToast = () => use(ToastValueContext);
