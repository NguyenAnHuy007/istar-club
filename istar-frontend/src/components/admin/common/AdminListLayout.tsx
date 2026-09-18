"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface AdminToast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export interface AdminListLayoutProps {
  children: React.ReactNode;
  toast?: AdminToast | null;
  onDismissToast?: () => void;
  className?: string;
  maxWidthClass?: string;
}

/**
 * Standard container layout wrapper for all Admin list views.
 * Standardizes max-width (max-w-[1720px]), responsive padding, and non-layout-shifting floating top toast alerts.
 * Pure DOM render without heavy translateY composite animations to guarantee 60fps performance.
 */
export default function AdminListLayout({
  children,
  toast,
  onDismissToast,
  className = "",
  maxWidthClass = "max-w-[1720px]",
}: AdminListLayoutProps) {
  // Auto-dismiss toast after 4 seconds
  React.useEffect(() => {
    if (toast && onDismissToast) {
      const timer = setTimeout(() => {
        onDismissToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismissToast]);

  const getToastIcon = (type: AdminToast["type"]) => {
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

  const getToastClasses = (type: AdminToast["type"]) => {
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

  return (
    <div className={`${maxWidthClass} w-full mx-auto pb-12 space-y-6 ${className}`}>
      {/* Floating Top Toast Popup — Zero layout shift */}
      <div
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none w-full max-w-lg px-4 flex flex-col items-center"
        aria-live="polite"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-2xl ${getToastClasses(
                toast.type
              )}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getToastIcon(toast.type)}
                <span className="font-medium truncate leading-normal">{toast.message}</span>
              </div>
              {onDismissToast && (
                <button
                  type="button"
                  onClick={onDismissToast}
                  className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                  title="Đóng thông báo"
                  aria-label="Đóng thông báo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area - Instant and silky smooth without layout shift */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
