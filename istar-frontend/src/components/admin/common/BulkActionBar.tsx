"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, X } from "lucide-react";

export interface BulkActionBarProps {
  selectedCount: number;
  unitName?: string;
  onClearSelection: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized floating or docked action bar that surfaces when 1 or more items are selected in an admin table.
 */
export default function BulkActionBar({
  selectedCount,
  unitName = "mục",
  onClearSelection,
  children,
  className = "",
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`mb-4 px-4 py-3 rounded-xl bg-[#0F0F12]/95 border border-[#255798]/40 shadow-[0_8px_32px_rgba(37,87,152,0.25)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 ${className}`}
        >
          {/* Selected Count */}
          <div className="flex items-center gap-2 text-sm text-[#EDEDEF]">
            <CheckSquare className="w-4 h-4 text-[#4d8ee8]" />
            <span>
              Đã chọn:{" "}
              <strong className="text-[#4d8ee8] font-semibold">
                {selectedCount}
              </strong>{" "}
              {unitName}
            </span>
          </div>

          {/* Action Buttons & Clear Selection */}
          <div className="flex items-center gap-2">
            {children}

            <button
              type="button"
              onClick={onClearSelection}
              className="p-1.5 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer ml-1"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
