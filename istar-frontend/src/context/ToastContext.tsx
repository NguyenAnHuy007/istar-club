"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${++idCounter.current}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, duration = 4000) => showToast(message, "success", duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration = 4500) => showToast(message, "error", duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration = 4000) => showToast(message, "warning", duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration = 4000) => showToast(message, "info", duration),
    [showToast]
  );

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-[#4d8ee8] shrink-0" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-[#0b1612]/95 border-emerald-500/30 text-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.2)]";
      case "error":
        return "bg-[#180c0e]/95 border-rose-500/30 text-rose-300 shadow-[0_8px_30px_rgba(244,63,94,0.2)]";
      case "warning":
        return "bg-[#181207]/95 border-amber-500/30 text-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.2)]";
      case "info":
      default:
        return "bg-[#080d18]/95 border-[#255798]/40 text-[#EDEDEF] shadow-[0_8px_30px_rgba(37,87,152,0.25)]";
    }
  };

  const value = useMemo(
    () => ({ showToast, success, error, warning, info, dismissToast }),
    [showToast, success, error, warning, info, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Floating Top Toast Container — Completely decoupled from layout flow (Zero Layout Shift) */}
      <div
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full max-w-lg px-4 flex flex-col items-center gap-2.5"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-2xl ${getToastStyles(
                toast.type
              )}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getToastIcon(toast.type)}
                <span className="font-medium truncate leading-normal">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                title="Đóng"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
