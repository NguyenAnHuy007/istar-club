"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterDatePicker from "./FilterDatePicker";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  children?: React.ReactNode;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  advancedFilters?: React.ReactNode;
  isAdvancedOpen?: boolean;
  onToggleAdvanced?: () => void;
  className?: string;
}

/**
 * Standard container for search & filter controls placed above admin tables.
 * Enforces uniform h-10 height, rounded-lg, border-white/10, and focus:ring-[#255798]/50.
 */
export default function FilterBar({
  children,
  activeFilterCount = 0,
  onClearFilters,
  advancedFilters,
  isAdvancedOpen,
  onToggleAdvanced,
  className = "",
}: FilterBarProps) {
  const [internalAdvancedOpen, setInternalAdvancedOpen] = useState(false);
  const showAdvanced = isAdvancedOpen !== undefined ? isAdvancedOpen : internalAdvancedOpen;
  const toggleAdvanced = onToggleAdvanced || (() => setInternalAdvancedOpen((prev) => !prev));

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div
      className={`relative z-30 w-full bg-[#0F0F12]/80 border border-white/10 rounded-xl p-3.5 sm:p-4 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.25)] mb-5 transition-all ${className}`}
    >
      {/* Primary Filter Row */}
      <div className="flex flex-wrap items-center gap-3">{children}</div>

      {/* Filter Status & Secondary Actions Bar */}
      {(advancedFilters || hasActiveFilters) && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Advanced Filters Toggle */}
            {advancedFilters && (
              <button
                type="button"
                onClick={toggleAdvanced}
                className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                  showAdvanced
                    ? "bg-[#255798]/20 border-[#255798]/50 text-[#4d8ee8]"
                    : "bg-white/[0.03] border-white/10 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bộ lọc nâng cao</span>
              </button>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc ({activeFilterCount})</span>
              </button>
            )}
          </div>

          <span className="text-[#8A8F98]/70 text-[11px] hidden sm:inline-block">
            {hasActiveFilters
              ? `Đang áp dụng ${activeFilterCount} tiêu chí lọc`
              : "Bộ lọc tự động cập nhật kết quả"}
          </span>
        </div>
      )}

      {/* Advanced Filters Collapsible Section */}
      <AnimatePresence>
        {showAdvanced && advancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {advancedFilters}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Standardized Search Input component for filter bars.
 * Enforces uniform 40px height (h-10), padding, rounded-lg, border-white/10, and focus ring.
 */
export function FilterSearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  debounceMs = 0,
  className = "flex-1 min-w-[220px]",
}: {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0) return;
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (debounceMs <= 0) {
      onChange(val);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8F98] pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-10 w-full pl-9 pr-8 bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-[#255798] focus:ring-2 focus:ring-[#255798]/50 text-[#EDEDEF] placeholder-[#8A8F98]/60 text-sm rounded-lg outline-none transition-all duration-200"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          title="Xóa từ khóa"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Standardized Dropdown Select component tailored for filter bars.
 * Enforces uniform 40px height (h-10), rounded-lg, border-white/10, and focus:ring-[#255798]/50.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Tất cả...",
  className = "w-full sm:w-[190px]",
  disabled = false,
}: {
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${isOpen ? "z-50" : "z-10"} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 w-full px-3.5 flex items-center justify-between gap-2 text-left text-sm rounded-lg bg-white/[0.03] border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#255798]/50 ${
          isOpen
            ? "border-[#255798] bg-[#0c0c14] shadow-[0_0_16px_rgba(37,87,152,0.25)]"
            : "border-white/10 hover:border-white/20"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span
          className={`truncate text-xs ${
            !selectedOption || selectedOption.value === ""
              ? "text-[#8A8F98]"
              : "text-[#EDEDEF] font-medium"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8A8F98] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#4d8ee8]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-50 min-w-[200px] w-full max-h-60 overflow-y-auto p-1.5 rounded-xl bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85)] space-y-0.5 scrollbar-thin scrollbar-thumb-white/10"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-[#255798]/20 text-[#4d8ee8] font-medium border border-[#255798]/30"
                      : "text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-[#4d8ee8]" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Standardized Date Input component for filter bars.
 */
export function FilterDateInput({
  value,
  onChange,
  placeholder,
  label,
  className = "w-full",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  return (
    <FilterDatePicker
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      className={className}
    />
  );
}

export { default as FilterDatePicker } from "./FilterDatePicker";
export type { FilterDatePickerProps } from "./FilterDatePicker";
