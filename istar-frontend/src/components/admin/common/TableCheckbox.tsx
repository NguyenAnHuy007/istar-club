"use client";

import React from "react";
import { Check, Minus } from "lucide-react";

export interface TableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Standardized tri-state checkbox for admin data tables and list selection.
 * Adheres to Linear-inspired dark mode styling with subtle indigo focus glow.
 */
export default function TableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  title,
  className = "",
  size = "md",
}: TableCheckboxProps) {
  const sizeClasses = size === "sm" ? "w-4 h-4 rounded" : "w-[18px] h-[18px] rounded-[5px]";
  const iconSizeClasses = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.stopPropagation();
      return;
    }
    if (onChange) {
      e.stopPropagation();
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      title={title}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#255798]/50 active:scale-[0.92] ${sizeClasses} ${
        checked
          ? "bg-gradient-to-br from-[#255798] to-[#316ebf] border border-[#316ebf] shadow-[0_0_10px_rgba(37,87,152,0.4)]"
          : indeterminate
          ? "bg-[#255798]/60 border border-[#316ebf] shadow-[0_0_6px_rgba(37,87,152,0.3)]"
          : "border border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.06]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {checked ? (
        <Check className={`${iconSizeClasses} text-white stroke-[3] pointer-events-none`} />
      ) : indeterminate ? (
        <Minus className={`${iconSizeClasses} text-white stroke-[3] pointer-events-none`} />
      ) : null}
    </button>
  );
}
