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
}

const AUTO_HIDE_MS = 6000;
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

  const showToast = useCallback<ToastApi["showToast"]>((message, tone = "success", action) => {
    window.clearTimeout(timer.current);
    setToast({ id: ++seq.current, message, tone, action });
    timer.current = window.setTimeout(() => setToast(null), AUTO_HIDE_MS);
  }, []);

  const api = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
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
