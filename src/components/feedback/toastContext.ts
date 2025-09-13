import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "info";
export type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
};

export type ToastCtx = {
  show: (
    message: string,
    opts?: Partial<{ variant: ToastVariant; duration: number }>
  ) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

export const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 3000,
  info: 3000,
  error: 4000,
};

export const ToastContext = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
