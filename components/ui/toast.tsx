"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  removeToast,
}: {
  toast: Toast;
  removeToast: (id: string) => void;
}) {
  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: "bg-green-500/20 border-green-500/40 text-green-300 backdrop-blur-sm shadow-lg shadow-green-500/30",
    error: "bg-red-500/20 border-red-500/40 text-red-300 backdrop-blur-sm shadow-lg shadow-red-500/30",
    warning: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300 backdrop-blur-sm shadow-lg shadow-yellow-500/30",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-300 backdrop-blur-sm shadow-lg shadow-blue-500/30",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border backdrop-blur-sm p-4 shadow-lg transition-all duration-300 font-[family-name:var(--font-orbitron)]",
        styles[toast.type]
      )}
      role="alert"
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <Icon className="size-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-semibold leading-relaxed">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 rounded-lg p-1.5 transition-all hover:bg-white/10 active:scale-95"
        aria-label="Close notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

