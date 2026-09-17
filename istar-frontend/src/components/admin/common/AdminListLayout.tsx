"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

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
 * Standardizes max-width (max-w-[1720px]), responsive padding, and toast alerts.
 * Pure DOM render without heavy translateY composite animations to guarantee 60fps performance.
 */
export default function AdminListLayout({
  children,
  toast,
  onDismissToast,
  className = "",
  maxWidthClass = "max-w-[1720px]",
}: AdminListLayoutProps) {
  const getToastIcon = (type: AdminToast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "error":
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
        return "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
      case "error":
        return "bg-rose-500/15 border-rose-500/30 text-rose-300";
      case "warning":
        return "bg-amber-500/15 border-amber-500/30 text-amber-300";
      case "info":
      default:
        return "bg-[#255798]/15 border-[#255798]/30 text-[#EDEDEF]";
    }
  };

  return (
    <div className={`${maxWidthClass} w-full mx-auto pb-12 space-y-6 ${className}`}>
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs backdrop-blur-md shadow-lg ${getToastClasses(
              toast.type
            )}`}
          >
            <div className="flex items-center gap-2.5">
              {getToastIcon(toast.type)}
              <span className="font-medium">{toast.message}</span>
            </div>
            {onDismissToast && (
              <button
                type="button"
                onClick={onDismissToast}
                className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Instant and silky smooth */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
